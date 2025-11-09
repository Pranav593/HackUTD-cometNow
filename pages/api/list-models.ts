/**
 * GET /api/list-models
 * Returns available Google Generative Language models via REST.
 */
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not configured' });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API Error:', errorText);
      return res.status(response.status).json({ 
        message: `Failed to list models: ${response.statusText}`,
        details: errorText
      });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Error in list-models handler:', error);
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message, stack: error.stack });
    }
    return res.status(500).json({ message: 'An unknown error occurred' });
  }
}
