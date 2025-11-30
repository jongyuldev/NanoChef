import { GoogleGenAI, Type } from "@google/genai";
import { ImageData, Meal } from "../types";

const API_KEY = process.env.API_KEY || '';

// Initialize the client with the API key
const ai = new GoogleGenAI({ apiKey: API_KEY });

const IMAGE_MODEL = 'gemini-2.5-flash-image';
const TEXT_MODEL = 'gemini-2.5-flash';

export const generateRecipes = async (image: ImageData): Promise<Meal[]> => {
  if (!API_KEY) throw new Error("API Key not found");

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              data: image.base64,
              mimeType: image.mimeType
            }
          },
          {
            text: `Act as a world-class chef. Analyze this image of ingredients. 
            Identify the ingredients and suggest 3 distinct, delicious meals that can be made primarily with these ingredients.
            
            For each meal, provide:
            1. A creative title
            2. Estimated cooking time
            3. Difficulty level (Easy/Medium/Hard)
            4. A list of ingredients needed
            5. Step-by-step cooking instructions
            6. A short, appetizing visual description of the final dish suitable for an AI image generator (e.g. "A rustic bowl of pasta with fresh basil and steam rising, professional food photography").
            
            Return the result as a JSON array.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              cookingTime: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              ingredients: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              instructions: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              visualDescription: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text generated");
    
    // Parse the JSON response
    const meals: Meal[] = JSON.parse(text);
    return meals;
  } catch (error) {
    console.error("Gemini Chef Error:", error);
    throw error;
  }
};

export const generateMealImage = async (description: string): Promise<string | null> => {
  if (!API_KEY) throw new Error("API Key not found");

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [
          {
            text: `Professional high-end food photography of ${description}, 4k resolution, appetizing, cinematic lighting, photorealistic`
          }
        ]
      }
    });

    // Check candidate parts for image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};

export const editImage = async (
  image: ImageData, 
  prompt: string
): Promise<{ text?: string; imageBase64?: string }> => {
  if (!API_KEY) throw new Error("API Key not found");

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              data: image.base64,
              mimeType: image.mimeType
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    let generatedImage: string | undefined;
    let generatedText: string | undefined;

    // Check candidate parts for image or text
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          generatedImage = part.inlineData.data;
        } else if (part.text) {
          generatedText = part.text;
        }
      }
    }

    return { text: generatedText, imageBase64: generatedImage };

  } catch (error) {
    console.error("Gemini Editor Error:", error);
    throw error;
  }
};