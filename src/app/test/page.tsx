'use client';

import { useState } from 'react';

export default function TestChat() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rawResponse, setRawResponse] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setLoading(true);
    setError('');
    setResponse('');
    setRawResponse('');
    
    try {
      const result = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }]
        }),
      });
      
      // Store the raw response for debugging
      const text = await result.text();
      setRawResponse(text);
      
      try {
        // Try to parse as JSON
        const data = JSON.parse(text);
        console.log("Response data:", data);
        
        // Log the entire data structure to see what we're getting
        console.log("Complete data structure:", JSON.stringify(data, null, 2));
        
        // Correctly extract the content - notice the changes here
        if (data && typeof data.content === 'string') {
          setResponse(data.content);
        } else if (data && data.response && typeof data.response.message === 'string') {
          // Fallback for response in original format
          setResponse(data.response.message);
        } else {
          console.log("Unexpected response structure:", data);
          setResponse("Received unexpected response structure");
        }
      } catch (parseError) {
        // Handle unknown type error
        const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
        setError(`Failed to parse response: ${errorMessage}`);
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      // Handle unknown type error
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      setError(`Network error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">WICFIN Test Chat</h1>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          placeholder="Type a message..."
        />
        <button 
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white p-2 rounded"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
      
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 rounded mb-4">
          <strong>Error:</strong>
          <p>{error}</p>
        </div>
      )}
      
      {response && (
        <div className="p-4 bg-gray-100 rounded mb-4">
          <strong>Response:</strong>
          <p className="whitespace-pre-wrap">{response}</p>
        </div>
      )}
      
      {rawResponse && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Raw Response (for debugging):</h2>
          <pre className="p-2 bg-gray-800 text-white rounded overflow-x-auto text-sm">
            {rawResponse}
          </pre>
        </div>
      )}
    </div>
  );
}