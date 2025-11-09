import { NextApiRequest, NextApiResponse } from 'next';
import genAI from '@/lib/gemini';

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

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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

    Based on the student's profile and the list of events, please recommend the top 5 events for this student.
    Return only a JSON array of the event IDs, like this: ["event_id_1", "event_id_2", "event_id_3", "event_id_4", "event_id_5"].
    Do not include any other text or explanation in your response.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // First try to parse the entire response as JSON
      const recommendedEventIds = JSON.parse(text);
      if (Array.isArray(recommendedEventIds)) {
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
        console.error('Failed to parse Gemini response:', text);
        return res.status(500).json({ message: 'Invalid response format from recommendation service' });
      }
    }
    
    return res.status(500).json({ message: 'Invalid response format from recommendation service' });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
      return res.status(500).json({ message: `Error generating recommendations: ${error.message}` });
    }
    return res.status(500).json({ message: 'Error generating recommendations' });
  }
}
