import { GoogleGenerativeAI } from "@google/generative-ai";

// Use server-side environment variable instead of client-side
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Gemini API key is not configured');
}

const genAI = new GoogleGenerativeAI(apiKey);

export default genAI;
