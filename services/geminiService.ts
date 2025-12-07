import { GoogleGenAI } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateResponse = async (prompt: string): Promise<string> => {
  try {
    // Using gemini-3-pro-preview as requested for "Gemini 3.0 Pro"
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 1024 }, // Enable thinking for better reasoning
      }
    });
    return response.text || "No response received.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to Gemini network. Please check your connection.";
  }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};

export const editImage = async (base64Image: string, prompt: string): Promise<string | null> => {
  try {
    // Extract base64 data and mime type
    const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return null;
    
    const mimeType = matches[1];
    const data = matches[2];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: data
            }
          },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Edit Error:", error);
    return null;
  }
};
