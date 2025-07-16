import { ReadableStream } from 'stream/web';

interface ResponseLike {
  status: number;
  statusText: string;
  body: ReadableStream<Uint8Array> | null;
}

/**
 * Transforms a standard SSE response into the format expected by Vercel AI SDK
 */
export async function adaptResponseToVercelAI(response: Response): Promise<Response> {
  if (!response.ok) {
    console.error(`Error response: ${response.status} ${response.statusText}`);
    return response; // Return original error response
  }
  
  if (!response.body) {
    console.error('Response body is null');
    return response;
  }
  
  // Create a TransformStream to modify the response
  const transformStream = new TransformStream({
    async transform(chunk, controller) {
      const text = new TextDecoder().decode(chunk);
      console.log("Raw chunk received:", text);
      
      // Process each line
      const lines = text.split('\n\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        
        if (line.includes('data: [DONE]')) {
          console.log("End of stream detected");
          // No need to transform this
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          continue;
        }
        
        if (line.startsWith('data: ')) {
          try {
            const data = line.slice(6);
            console.log("Data chunk:", data);
            
            // Parse and reformat to ensure it matches what Vercel AI SDK expects
            const parsed = JSON.parse(data);
            
            // Make sure it has the expected structure
            const formatted = {
              id: parsed.id || 'chatcmpl-adapter',
              object: parsed.object || 'chat.completion.chunk',
              created: parsed.created || Date.now(),
              model: parsed.model || 'wicfin-model',
              choices: parsed.choices || [{
                index: 0,
                delta: {
                  content: data
                },
                finish_reason: null
              }]
            };
            
            // Send properly formatted chunk
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(formatted)}\n\n`));
          } catch (e) {
            console.warn("Error processing data chunk:", e);
            // Just pass through the original data
            controller.enqueue(new TextEncoder().encode(line + '\n\n'));
          }
        } else {
          // Pass through any non-data lines
          controller.enqueue(new TextEncoder().encode(line + '\n\n'));
        }
      }
    }
  });
  
  // Create a new response with the transformed body
  const transformedBody = response.body.pipeThrough(transformStream);
  
  return new Response(transformedBody, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    },
    status: response.status,
    statusText: response.statusText
  });
}