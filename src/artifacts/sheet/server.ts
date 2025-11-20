import { myProvider } from '@/libs/ai/providers';
import { sheetPrompt, updateDocumentPrompt } from '@/libs/ai/prompts';
import { createDocumentHandler } from '@/libs/artifacts/server';
import { z } from 'zod';

// Function to generate sheet content by calling the Python backend directly
async function generateSheetFromPrompt(prompt: string, system: string): Promise<string> {
  try {
    console.log("Sending sheet generation request to Python backend");
    const response = await fetch('http://localhost:8082/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: prompt,
        system: system,
        mode: 'sheet_generation'
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Try to extract CSV from different possible response formats
    if (data.success && data.analysis && data.analysis.csv) {
      return data.analysis.csv;
    } else if (data.success && data.analysis && data.analysis.content) {
      return data.analysis.content;
    } else if (data.success && data.csv) {
      return data.csv;
    } else {
      console.warn("Unexpected API response format:", data);
      return "header1,header2,header3\nNo data,was returned,from backend";
    }
  } catch (error) {
    console.error("Error generating sheet:", error);
    return "error,message\nFailed to generate sheet," + error;
  }
}

export const sheetDocumentHandler = createDocumentHandler<'sheet'>({
  kind: 'sheet',
  onCreateDocument: async ({ title, dataStream }) => {
    try {
      // Generate sheet content
      const csvContent = await generateSheetFromPrompt(title, sheetPrompt);
      
      // Stream the content to the client
      dataStream.writeData({
        type: 'sheet-delta',
        content: csvContent,
      });
      
      return csvContent;
    } catch (error) {
      console.error("Error in sheet generation:", error);
      
      // Return a simple error CSV
      const errorCsv = "error,message\nFailed to generate sheet," + error;
      
      dataStream.writeData({
        type: 'sheet-delta',
        content: errorCsv,
      });
      
      return errorCsv;
    }
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    try {
      // Generate updated sheet content
      const system = updateDocumentPrompt(document.content, 'sheet');
      const updatedCsvContent = await generateSheetFromPrompt(description, system);
      
      // Stream the content to the client
      dataStream.writeData({
        type: 'sheet-delta',
        content: updatedCsvContent,
      });
      
      return updatedCsvContent;
    } catch (error) {
      console.error("Error in sheet update:", error);
      
      // Return the original content if update fails
      dataStream.writeData({
        type: 'sheet-delta',
        content: document.content,
      });
      
      return document.content;
    }
  },
});