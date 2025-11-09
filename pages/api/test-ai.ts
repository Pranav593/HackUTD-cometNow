/**
 * GET /api/test-ai
 * Smoke test for Gemini connectivity via SDK.
 */
import { NextApiRequest, NextApiResponse } from 'next';
import genAI from '@/lib/gemini';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-pro' });
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    const text = response.text();
    res.status(200).json({ 
      success: true, 
      message: text,
      modelInfo: {
        model: 'models/gemini-pro'
      }
    });
  } catch (error) {
    console.error('Error testing Google AI:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      modelInfo: {
        model: 'models/gemini-pro'
      }
    });
  }
}