// src/app/libs/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatResponse {
  message: string;
  recommendations?: string[];
  actions?: Array<{
    type: string;
    label: string;
    value: string;
  }>;
}

// Function to send a chat message
export async function sendChatMessage(
  message: string,
  applicationId?: string,
  chatHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  try {
    // In development, use mock response for testing
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      return mockChatResponse(message);
    }
    
    // Get auth token if available
    const token = localStorage.getItem('wicfin_access_token');
    
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        message,
        applicationId,
        chatHistory
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.response;
    } else {
      throw new Error(data.error || 'Failed to get chat response');
    }
  } catch (error) {
    console.error('Error sending chat message:', error);
    return {
      message: 'I apologize, but I encountered an issue processing your request. Please try again later.'
    };
  }
}

// Mock response function for testing
function mockChatResponse(message: string): ChatResponse {
  // Simple keyword-based responses for development
  if (message.toLowerCase().includes('interest rate') || message.toLowerCase().includes('rates')) {
    return {
      message: 'Our interest rates typically range from 5.99% to 19.99% depending on your credit score, loan amount, and term. For borrowers with excellent credit, we offer rates as low as 5.99% APR.',
      recommendations: [
        'What affects my interest rate?',
        'How can I get a lower rate?',
        'What is the current average rate?'
      ]
    };
  } 
  else if (message.toLowerCase().includes('qualify') || message.toLowerCase().includes('eligibility')) {
    return {
      message: 'To qualify for a loan, you typically need a credit score of at least 620, stable income, and a debt-to-income ratio below 43%. The specific requirements may vary based on the loan amount and your financial profile.',
      recommendations: [
        'How is my debt-to-income calculated?',
        'What if my credit score is below 620?',
        'What documents do I need to apply?'
      ]
    };
  }
  else {
    return {
      message: 'I\'m your AI loan assistant. I can help answer questions about our loan products, application process, eligibility requirements, and more. What would you like to know about?',
      recommendations: [
        'Tell me about your loan options',
        'How does the application process work?',
        'What are the current interest rates?'
      ]
    };
  }
}