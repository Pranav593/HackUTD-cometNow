/**
 * Gemini client accessor.
 * Does not throw on import; calling code can handle missing keys gracefully.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
let _instance: GoogleGenerativeAI | null = null;
if (apiKey) {
	_instance = new GoogleGenerativeAI(apiKey);
}

export const getGenAI = () => _instance;

// Backward-compatible default with a guard that throws when used without key
const genAI = {
	getGenerativeModel: (options: any) => {
		if (!_instance) {
			const err = new Error("GEMINI_API_KEY is not configured");
			(err as any).status = 500;
			throw err;
		}
		return _instance.getGenerativeModel(options);
	},
};

export default genAI as unknown as GoogleGenerativeAI;

