import { NextApiRequest, NextApiResponse } from 'next';
import genAI from '@/lib/gemini';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = 'You are a helpful student advisor at UTD. Say "Hello! I am ready to help UTD students!" to test the connection.';
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.status(200).json({ success: true, message: text });
  } catch (error) {
    console.error('Error testing Gemini:', error);
    if (error instanceof Error) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Unknown error occurred' });
    }
  }
}