
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Initialize Gemini
// NOTE: In a production app, these calls should be proxied through a backend to protect the API Key.
// For deployment compatibility, we check both Vite's import.meta.env and standard process.env
const getApiKey = () => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  // If no key is found, return undefined. The SDK might throw if used, but won't crash app start.
  return undefined;
};

const apiKey = getApiKey();
// Only initialize if key exists, otherwise let it fail gracefully inside the function
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const parseVoiceOrder = async (transcript: string, menu: Product[]): Promise<{ id: string, quantity: number }[]> => {
  if (!ai) {
    console.error("Gemini API Key is missing. Please set VITE_API_KEY or API_KEY in your environment variables.");
    return [];
  }

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
