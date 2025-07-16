import { NextResponse } from 'next/server';
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const encoder = new TextEncoder();
    
    // Create the response stream manually with exact byte encoding
    const stream = new ReadableStream({
      start(controller) {
        // Initial message
        controller.enqueue(encoder.encode('data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"wicfin-assistant","choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}\n\n'));
        
        // Content message - sent as a single chunk
        controller.enqueue(encoder.encode('data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"wicfin-assistant","choices":[{"index":0,"delta":{"content":"This is a test response from WICFIN chatbot."},"finish_reason":null}]}\n\n'));
        
        // Finish message
        controller.enqueue(encoder.encode('data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"wicfin-assistant","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\n'));
        
        // Final DONE marker
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Error in chat test route:', error);
    return new Response(
      `data: {"error": "${error instanceof Error ? error.message : String(error)}"}\n\n`,
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
}