import { NextApiRequest, NextApiResponse } from 'next';
import genAI from '@/lib/gemini';

// Helper function for retrying with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // Check if the error is a GoogleGenerativeAI error with status 503
    if (retries > 0 && error.status === 503) {
      console.log(
        `Model overloaded. Retrying in ${delay / 1000}s... (${retries} retries left)`
      );
      await new Promise((res) => setTimeout(res, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    // Re-throw other errors
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userProfile, events } = req.body;

  if (!userProfile || !events) {
    return res.status(400).json({ message: 'Missing user profile or events' });
  }

  // Validate user profile structure
  if (!userProfile.major || !userProfile.year || !Array.isArray(userProfile.interests)) {
    return res.status(400).json({ message: 'Invalid user profile format' });
  }

  // Validate events array
  if (!Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ message: 'No events provided' });
  }

  let model;
  try {
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  } catch (err) {
    console.error('[recommend] Gemini unavailable:', err);
    // Fallback: choose 5 highest going or earliest events purely client-side
    const sorted = [...events]
      .sort((a: any,b: any) => (b.going||0) - (a.going||0))
      .slice(0,5)
      .map((e:any) => e.id);
    return res.status(200).json({ recommendedEventIds: sorted });
  }

  const prompt = `
    You are a helpful student advisor at The University of Texas at Dallas.
    A student has asked for event recommendations.
    Here is the student's profile:
    - Major: ${userProfile.major}
    - Year: ${userProfile.year}
    - Interests: ${userProfile.interests.join(', ')}

    Here is a list of available events:
    ${events.map((event: any) => `
      - Event ID: ${event.id}
      - Title: ${event.title}
      - Category: ${event.category}
      - Location: ${event.location}
      - Going: ${event.going || 0}
    `).join('')}

    Based on the student's profile and the list of events, you MUST recommend exactly 5 events for this student.
    If there are not enough good matches, you must still select the 5 most suitable events from the list, even if the match is not perfect. Prioritize social events or events with high attendance if no other criteria match.
    It is critical that you return a JSON array containing exactly 5 event IDs. Do not return fewer than 5.
    Return only a JSON array of the event IDs, like this: ["event_id_1", "event_id_2", "event_id_3", "event_id_4", "event_id_5"].
    Do not include any other text or explanation in your response.
  `;

  // Avoid logging full prompt to reduce noise
  console.log('[recommend] Prompt length:', prompt.length);

  try {
    const generationFn = () => model.generateContent(prompt);
    const result = await retryWithBackoff(generationFn);
    
    const response = await result.response;
    const text = response.text();
    console.log("Received raw text from AI:", text);
    
    try {
      // First try to parse the entire response as JSON
      const recommendedEventIds = JSON.parse(text);
      if (Array.isArray(recommendedEventIds)) {
        console.log('AI Recommendations (parsed):', recommendedEventIds);
        return res.status(200).json({ recommendedEventIds });
      }
    } catch {
      // If that fails, try to extract JSON array from text
      try {
        const jsonString = text.substring(text.indexOf('['), text.lastIndexOf(']') + 1);
        const recommendedEventIds = JSON.parse(jsonString);
        if (Array.isArray(recommendedEventIds)) {
          return res.status(200).json({ recommendedEventIds });
        }
      } catch {
        console.error('Failed to parse Google AI response:', text);
        return res.status(500).json({ message: 'Invalid response format from recommendation service' });
      }
    }
    
    return res.status(500).json({ message: 'Invalid response format from recommendation service' });
  } catch (error) {
    console.error('Error calling Google AI API:', error);
    if (error instanceof Error) {
      const status = (error as any).status || 500;
      return res.status(status).json({ 
        message: `Error generating recommendations: ${error.message}`,
        details: error instanceof Error ? error.stack : undefined
      });
    }
    return res.status(500).json({ message: 'Error generating recommendations' });
  }
}
