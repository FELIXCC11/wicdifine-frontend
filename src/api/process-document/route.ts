// wicfin-chatbot/src/app/api/process-document/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, documentId } = await req.json();
    if (!text) {
      return NextResponse.json(
        { success: false, error: 'No document text provided' },
        { status: 400 }
      );
    }

    // Forward the request to the Python AI service
    const aiServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8082';
    const response = await fetch(`${aiServiceUrl}/api/process-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        documentId,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI service responded with status ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in process-document API route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}