// src/artifacts/image/server.tsx
import { myProvider } from '@/libs/ai/providers';
import { createDocumentHandler } from '@/libs/artifacts/server';

// Instead of relying on the ai package for image generation,
// implement our own function to call the Python backend
async function generateImageFromPrompt(prompt: string): Promise<string> {
  try {
    console.log("Sending image generation request to Python backend:", prompt);
    
    const response = await fetch('http://localhost:8082/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: prompt,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.imageUrl) {
      return data.imageUrl;
    } else if (data.success && data.base64Image) {
      return `data:image/png;base64,${data.base64Image}`;
    } else {
      throw new Error("No image data returned from backend");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream }) => {
    try {
      // Get image from Python backend
      const imageUrl = await generateImageFromPrompt(title);
      
      // Stream the image URL to the client
      dataStream.writeData({
        type: 'image',
        url: imageUrl,
      });
      
      return imageUrl;
    } catch (error) {
      console.error("Error in image generation:", error);
      
      // Return a placeholder error image URL
      const errorImageUrl = "https://via.placeholder.com/512x512?text=Image+Generation+Failed";
      
      dataStream.writeData({
        type: 'image',
        url: errorImageUrl,
      });
      
      return errorImageUrl;
    }
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    try {
      // Generate updated image based on description
      const updatedImageUrl = await generateImageFromPrompt(description);
      
      // Stream the image URL to the client
      dataStream.writeData({
        type: 'image',
        url: updatedImageUrl,
      });
      
      return updatedImageUrl;
    } catch (error) {
      console.error("Error in image update:", error);
      
      // Return the original image URL if update fails
      dataStream.writeData({
        type: 'image',
        url: document.content,
      });
      
      return document.content;
    }
  },
});