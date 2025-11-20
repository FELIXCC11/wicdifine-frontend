// wicfin-chatbot/src/app/api/validate-documents/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { applicationData, documentFeatures } = await req.json();
    if (!applicationData || !documentFeatures) {
      return NextResponse.json(
        { success: false, error: 'Missing application data or document features' },
        { status: 400 }
      );
    }

    // Forward the request to the Python AI service
    const aiServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8082';
    const response = await fetch(`${aiServiceUrl}/api/validate-documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicationData,
        documentFeatures,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI service responded with status ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in validate-documents API route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}