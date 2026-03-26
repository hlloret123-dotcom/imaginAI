import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { AspectRatio, ModelType } from "../types";

// Initialize the client with the API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GenerateImageParams {
  prompt: string;
  aspectRatio: AspectRatio;
  model: ModelType;
  referenceImage?: string; // base64 string without data:image/... prefix
  mimeType?: string;
}

export const generateImage = async ({
  prompt,
  aspectRatio,
  model,
  referenceImage,
  mimeType
}: GenerateImageParams): Promise<string> => {
  try {
    // Check if using Imagen model
    if (model.includes('imagen')) {
        if (referenceImage) {
            throw new Error("Imagen models currently only support Text-to-Image generation. Please select a Gemini model for Image-to-Image tasks.");
        }

        const response = await ai.models.generateImages({
            model: model,
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio,
                // Imagen specific safety parameters
                // 'block_none' is often not supported, using 'block_low' as a permissive alternative
                personGeneration: 'allow_adult',
            } as any,
        });

        const base64Data = response.generatedImages?.[0]?.image?.imageBytes;
        if (!base64Data) {
            throw new Error("Imagen model generated a response but no image data was found.");
        }
        
        return `data:image/jpeg;base64,${base64Data}`;
    }

    // Default: Gemini Models (generateContent)
    const parts: any[] = [];

    // If we have a reference image, add it to the parts (Image-to-Image / Editing)
    if (referenceImage && mimeType) {
      parts.push({
        inlineData: {
          data: referenceImage,
          mimeType: mimeType,
        },
      });
    }

    // Add the text prompt
    parts.push({
      text: prompt,
    });

    // Note: contents should be an array of Content objects for best compatibility
    const response = await ai.models.generateContent({
      model: model,
      contents: [{
        parts: parts,
      }],
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
        // Removed safetySettings with BLOCK_NONE as it is explicitly not supported for this model/endpoint.
        // Relying on default server settings.
      },
    });

    // Check if candidates exist
    if (!response.candidates || response.candidates.length === 0) {
       // Try to find a block reason if available in the response object
       const anyResponse = response as any;
       if (anyResponse.promptFeedback?.blockReason) {
           throw new Error(`Generation blocked: ${anyResponse.promptFeedback.blockReason}`);
       }
       throw new Error("The AI model refused to generate content. This often happens with prompts that may violate safety policies.");
    }

    // Iterate through parts to find the image
    const candidate = response.candidates[0];
    
    // Check finish reason if available
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        if (candidate.finishReason === 'SAFETY') {
            throw new Error("Generation blocked by safety settings. Please modify your prompt.");
        }
    }

    if (!candidate.content || !candidate.content.parts) {
      throw new Error("The model returned a candidate but no content parts.");
    }

    let imageUrl: string | null = null;

    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        // Construct standard data URL
        const mimeType = part.inlineData.mimeType || 'image/png';
        imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
        break; // Stop after finding the first image
      }
    }

    if (!imageUrl) {
        // Fallback: Check if there is a text refusal or error explanation in text parts
        const textPart = candidate.content.parts.find(p => p.text);
        if (textPart && textPart.text) {
             throw new Error(`Model message: ${textPart.text}`);
        }
        throw new Error("The model generated a response but no image data was found.");
    }

    return imageUrl;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    let message = "Failed to generate image.";
    if (error.message) {
      message = error.message;
    }
    // Handle specific error message for clarity
    if (message.includes("block_none")) {
        message = "The selected safety setting is not supported by the model. Please try again (settings have been adjusted).";
    }
    throw new Error(message);
  }
};