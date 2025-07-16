
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message || "";
    const chatId = body.chatId || "";
    
    console.log("Processing message:", message, "for chat:", chatId);
    
    
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8082';
    console.log("Connecting to Python backend at:", pythonBackendUrl);
    
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("Request timeout - aborting");
      controller.abort();
    }, 5000); 
    
    try {
      console.log(`Sending request to: ${pythonBackendUrl}/api/chat`);
      
      
      console.log("Request body:", JSON.stringify({ message, chatId }));
      
      const response = await fetch(`${pythonBackendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: message,
          chatId: chatId
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); 
      
      console.log("Backend response status:", response.status);
      
      
      const responseText = await response.text();
      console.log("Raw response text:", responseText);
      
      let responseData;
      try {
        
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        throw new Error("Invalid JSON response from backend");
      }
      
      console.log("Parsed response data:", responseData);
      
      
      if (responseData && responseData.success === true && responseData.response) {
        return new Response(JSON.stringify(responseData), {
          headers: { 'Content-Type': 'application/json' }
        });
      } 
      
      else if (responseData && responseData.success === false) {
        console.warn("Backend reported error:", responseData.error);
        return new Response(JSON.stringify({
          success: true,
          response: {
            message: `I'm having trouble with the loan calculation right now. Please try asking about our loan types or interest rates without specific numbers for now.`
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      else {
        console.error("Unexpected response format:", responseData);
        throw new Error("Unexpected response format from backend");
      }
    } catch (fetchError) {
      clearTimeout(timeoutId); 
      console.error("Fetch error:", fetchError);
      
      
      return new Response(JSON.stringify({
        success: true,
        response: {
          message: `I'm having trouble connecting to my knowledge base. Please try again in a moment.`
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error in chat API route:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json' 
      }
    });
  }
}