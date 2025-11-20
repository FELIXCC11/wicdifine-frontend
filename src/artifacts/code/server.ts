// src/artifacts/code/server.ts
import { createDocumentHandler } from '@/libs/artifacts/server';

// Function to send requests to Python backend directly
async function generateCodeFromPrompt(prompt: string): Promise<string> {
  try {
    console.log("Sending code generation request to Python backend:", prompt);
    
    const response = await fetch('http://localhost:8082/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: prompt,
        mode: 'code_generation'
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Python backend response:", data);
    
    if (data.success && data.analysis && data.analysis.code) {
      return data.analysis.code;
    } else if (data.success && data.analysis && data.analysis.result) {
      // Alternative format
      return data.analysis.result;
    } else if (data.code) {
      // Direct code format
      return data.code;
    } else {
      return `// Generated code placeholder for: ${prompt}\n// No code was returned from the backend`;
    }
  } catch (error) {
    console.error("Error generating code:", error);
    return `// Error: Failed to connect to AI service\n// ${error}`;
  }
}

// Document handler that connects to your Python backend
export const codeDocumentHandler = createDocumentHandler<'code'>({
  kind: 'code',
  onCreateDocument: async ({ title, dataStream }) => {
    try {
      // Get code from Python backend
      const code = await generateCodeFromPrompt(title);
      
      // Stream the code to the client
      dataStream.writeData({
        type: 'code-delta',
        content: code,
      });
      
      return code;
    } catch (error) {
      console.error("Error in code generation:", error);
      const fallbackCode = `// Error generating code for: ${title}\n// ${error}`;
      
      dataStream.writeData({
        type: 'code-delta',
        content: fallbackCode,
      });
      
      return fallbackCode;
    }
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    try {
      // Generate updated code based on existing code and description
      const prompt = `Update this code based on the following description:\n\nCurrent code:\n${document.content}\n\nDescription: ${description}`;
      const updatedCode = await generateCodeFromPrompt(prompt);
      
      // Stream the code to the client
      dataStream.writeData({
        type: 'code-delta',
        content: updatedCode,
      });
      
      return updatedCode;
    } catch (error) {
      console.error("Error in code update:", error);
      const fallbackCode = `${document.content}\n\n// Error updating code: ${error}`;
      
      dataStream.writeData({
        type: 'code-delta',
        content: fallbackCode,
      });
      
      return fallbackCode;
    }
  },
});