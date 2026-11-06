import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI SDK using your Vite environment variable
const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY 
});

export async function askGeminiAboutNotes(userPrompt, courseContext) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: `You are an expert AI tutor for the Tezgam LMS portal at the University of Turbat. Here are the active course notes and lecture titles for context: "${courseContext}".` },
            { text: `Student Question / Request: ${userPrompt}` }
          ]
        }
      ],
    });

    return response.text || "I processed your request, but received an empty response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error connecting to the Gemini API. Please verify your VITE_GEMINI_API_KEY environment variable.";
  }
}