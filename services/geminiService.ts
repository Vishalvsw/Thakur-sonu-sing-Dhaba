import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Initialize Gemini
// NOTE: In a production app, these calls should be proxied through a backend to protect the API Key.
// For this demo, we assume the environment variable is set in the build.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseVoiceOrder = async (transcript: string, menu: Product[]): Promise<{ id: string, quantity: number }[]> => {
  const model = "gemini-2.5-flash";
  
  // Create context from the passed menu (dynamic), allowing recognition of new items
  const menuContext = menu.map(p => `${p.id}: ${p.name} (${p.localName})`).join(', ');

  const prompt = `
    You are an ordering assistant for a restaurant.
    Menu Items: [${menuContext}]
    
    User Request: "${transcript}"
    
    Task: Extract items and quantities. Map loosely matched names to the specific IDs provided in the menu.
    If a quantity is not specified, assume 1.
    Return ONLY a JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  quantity: { type: Type.INTEGER }
                }
              }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{"items": []}');
    return result.items || [];
  } catch (error) {
    console.error("Gemini Parse Error:", error);
    return [];
  }
};