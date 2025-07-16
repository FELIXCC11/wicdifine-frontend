import { myProvider } from '@/libs/ai/providers';
import { createDocumentHandler } from '@/libs/artifacts/server';
import { updateDocumentPrompt } from '@/libs/ai/prompts';

// Function to generate text content by calling the Python backend directly
async function generateTextFromPrompt(prompt: string, system: string): Promise<string> {
  try {
    console.log("Sending text generation request to Python backend");
    
    // Setup for streaming response
    const response = await fetch('http://localhost:8082/api/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream' 
      },
      body: JSON.stringify({ 
        message: prompt,
        system: system,
        mode: 'artifact_generation'
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Read the stream in chunks
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get reader from response");
    }
    
    const decoder = new TextDecoder();
    let result = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        // Handle SSE format (data: {...})
        let content = line;
        if (line.startsWith('data: ')) {
          content = line.slice(6);
        }
        
        if (content === '[DONE]') continue;
        
        try {
          // Try to parse as JSON
          const parsed = JSON.parse(content);
          
          // Extract text from different possible formats
          if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
            result += parsed.choices[0].delta.content;
          } else if (parsed.response && parsed.response.message) {
            result += parsed.response.message;
          } else if (parsed.success && parsed.message) {
            result += parsed.message;
          } else if (parsed.text) {
            result += parsed.text;
          }
        } catch (err) {
          // If not valid JSON, just use the content directly
          if (!content.includes('{') && !content.includes('}')) {
            result += content;
          }
        }
      }
    }
    
    return result || "No content was generated.";
  } catch (error) {
    console.error("Error generating text content:", error);
    return "Error generating text content: " + error;
  }
}

export const textDocumentHandler = createDocumentHandler<'text'>({
  kind: 'text',
  onCreateDocument: async ({ title, dataStream }) => {
    try {
      const system = 'Write about the given topic. Markdown is supported. Use headings wherever appropriate.';
      
      // Open a connection to the Python backend
      const response = await fetch('http://localhost:8082/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream' 
        },
        body: JSON.stringify({ 
          message: title,
          system: system,
          mode: 'artifact_generation'
        }),
      });
      
      if (!response.ok || !response.body) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      
      // Read and process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (!line.trim()) continue;
          
          // Handle SSE format
          let content = line;
          if (line.startsWith('data: ')) {
            content = line.slice(6);
          }
          
          if (content === '[DONE]') continue;
          
          try {
            // Try to parse as JSON
            const parsed = JSON.parse(content);
            
            // Extract text from different formats
            let textDelta = '';
            
            if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
              textDelta = parsed.choices[0].delta.content;
            } else if (parsed.response && parsed.response.message) {
              textDelta = parsed.response.message;
            } else if (parsed.success && parsed.message) {
              textDelta = parsed.message;
            } else if (parsed.text) {
              textDelta = parsed.text;
            }
            
            if (textDelta) {
              fullContent += textDelta;
              
              // Stream the content to the client
              dataStream.writeData({
                type: 'text-delta',
                content: textDelta,
              });
            }
          } catch (err) {
            // If not valid JSON, try to use the content directly
            if (!content.includes('{') && !content.includes('}')) {
              fullContent += content;
              
              dataStream.writeData({
                type: 'text-delta',
                content: content,
              });
            }
          }
        }
      }
      
      return fullContent;
    } catch (error) {
      console.error("Error in text generation:", error);
      
      const errorMessage = "Error generating text content: " + error;
      
      dataStream.writeData({
        type: 'text-delta',
        content: errorMessage,
      });
      
      return errorMessage;
    }
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    try {
      const system = updateDocumentPrompt(document.content, 'text');
      
      // Open a connection to the Python backend
      const response = await fetch('http://localhost:8082/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream' 
        },
        body: JSON.stringify({ 
          message: description,
          system: system,
          context: document.content,
          mode: 'artifact_update'
        }),
      });
      
      if (!response.ok || !response.body) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      
      // Read and process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (!line.trim()) continue;
          
          // Handle SSE format
          let content = line;
          if (line.startsWith('data: ')) {
            content = line.slice(6);
          }
          
          if (content === '[DONE]') continue;
          
          try {
            // Try to parse as JSON
            const parsed = JSON.parse(content);
            
            // Extract text from different formats
            let textDelta = '';
            
            if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
              textDelta = parsed.choices[0].delta.content;
            } else if (parsed.response && parsed.response.message) {
              textDelta = parsed.response.message;
            } else if (parsed.success && parsed.message) {
              textDelta = parsed.message;
            } else if (parsed.text) {
              textDelta = parsed.text;
            }
            
            if (textDelta) {
              fullContent += textDelta;
              
              // Stream the content to the client
              dataStream.writeData({
                type: 'text-delta',
                content: textDelta,
              });
            }
          } catch (err) {
            // If not valid JSON, try to use the content directly
            if (!content.includes('{') && !content.includes('}')) {
              fullContent += content;
              
              dataStream.writeData({
                type: 'text-delta',
                content: content,
              });
            }
          }
        }
      }
      
      return fullContent || document.content;
    } catch (error) {
      console.error("Error in text update:", error);
      
      dataStream.writeData({
        type: 'text-delta',
        content: "Error updating content: " + error,
      });
      
      // Return the original content if update fails
      return document.content;
    }
  },
});