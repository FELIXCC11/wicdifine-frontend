const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || 'http://localhost:8082';

export type LanguageModelV1 = {
  provider: string;
  modelId: string;
  generate: (input: any) => Promise<any>;
  stream: (input: any) => Promise<any>;
};

// This is a custom implementation for the AI SDK
export const myProvider = {
  languageModel: (modelName: string): LanguageModelV1 => {
    return {
      provider: "python-backend",
      modelId: modelName,
      
      generate: async (input) => {
        try {
          console.log("Generating non-streaming response from Python backend");
          
          // Extract the message from input
          const messages = Array.isArray(input.messages) ? input.messages : [];
          const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
          const messageContent = lastMessage?.content || input.prompt || "";
          
          // Make request to Python backend
          const response = await fetch(`${PYTHON_BACKEND_URL}/api/chat`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: messageContent })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          // Parse response
          const data = await response.json();
          console.log("Python backend response:", data);
          
          // Return in the expected format
          if (data && data.success && data.response && data.response.message) {
            return {
              text: data.response.message,
              usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
            };
          } else {
            return {
              text: "Error: Unexpected response format from backend",
              usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15 }
            };
          }
        } catch (error) {
          console.error("Error in generate:", error);
          throw error;
        }
      },
      
      stream: async (input) => {
        try {
          console.log("Streaming response from Python backend");
          
          // Get the message from input
          const messages = Array.isArray(input.messages) ? input.messages : [];
          const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
          const messageContent = lastMessage?.content || input.prompt || "";
          
          console.log("Sending message to Python backend:", messageContent);
          
          // Make request to Python backend for JSON response (not streaming)
          // This is simpler and more reliable than handling streaming
          const response = await fetch(`${PYTHON_BACKEND_URL}/api/chat`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: messageContent })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          // Parse the response
          const data = await response.json();
          console.log("Python backend response:", data);
          
          // Extract the message text
          const messageText = data?.response?.message || "No response from backend";
          
          // Create a ReadableStream that simulates streaming the response
          // This makes it compatible with the AI SDK's expectations
          const stream = new ReadableStream({
            start(controller) {
              // Send the message in chunks to simulate streaming
              const words = messageText.split(' ');
              
              // Send initial chunk
              const initialChunk = `data: {"id":"chatcmpl-${Date.now()}","object":"chat.completion.chunk","created":${Math.floor(Date.now()/1000)},"model":"wicfin-assistant","choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}\n\n`;
              controller.enqueue(new TextEncoder().encode(initialChunk));
              
              // Send each word as a separate chunk
              words.forEach((word: string, index: number) => { // Added type annotations here
                setTimeout(() => {
                  const chunk = `data: {"id":"chatcmpl-${Date.now()}","object":"chat.completion.chunk","created":${Math.floor(Date.now()/1000)},"model":"wicfin-assistant","choices":[{"index":0,"delta":{"content":"${word} "},"finish_reason":null}]}\n\n`;
                  controller.enqueue(new TextEncoder().encode(chunk));
                  
                  // If it's the last word, send the completion signal
                  if (index === words.length - 1) {
                    const completionChunk = `data: {"id":"chatcmpl-${Date.now()}","object":"chat.completion.chunk","created":${Math.floor(Date.now()/1000)},"model":"wicfin-assistant","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\n`;
                    controller.enqueue(new TextEncoder().encode(completionChunk));
                    controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
                    controller.close();
                  }
                }, index * 50); // 50ms delay between words to simulate streaming
              });
            }
          });
          
          // Return a Response object with the stream
          return new Response(stream, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive'
            }
          });
        } catch (error) {
          console.error("Error in stream:", error);
          throw error;
        }
      }
    };
  }
};

// This parser should be configured somewhere in your app
export const streamParser = {
  parse: (chunk: string) => {
    try {
      if (chunk.includes('[DONE]')) {
        return { done: true };
      }
      
      if (chunk.startsWith('data: ')) {
        const content = chunk.slice(6).trim();
        if (!content) return null;
        
        try {
          const parsed = JSON.parse(content);
          return parsed;
        } catch (e) {
          console.warn("Not valid JSON:", content);
          return { text: content };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Parse error:', error);
      return null;
    }
  }
};