// C:\Users\Felix\WICFIN\wicfin-chatbot\src\app\chat\api\document\route.ts
import { auth } from '@/app/auth/auth';
import type { ArtifactKind } from '@/components/artifact';
import {
  deleteDocumentsByIdAfterTimestamp,
  getDocumentsById,
  saveDocument,
} from '@/libs/db/queries';
import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const session = await auth();

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const documents = await getDocumentsById({ id });

  const [document] = documents;

  if (!document) {
    return new Response('Not found', { status: 404 });
  }

  if (document.userId !== session.user.id) {
    return new Response('Forbidden', { status: 403 });
  }

  return Response.json(documents, { status: 200 });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const contentType = request.headers.get('content-type') || '';
  
  if (contentType.includes('multipart/form-data')) {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const documentType = formData.get('documentType') as string || 'general';
      
      if (!file) {
        return Response.json({ 
          success: false, 
          error: 'No file provided' 
        }, { status: 400 });
      }
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const content = buffer.toString('utf8');
      
      const documentId = id || uuidv4();
      
      const document = await saveDocument({
        id: documentId,
        content,
        title: file.name,
        kind: 'text',
        userId: session.user.id,
      });
      
      const wicchainId = `wc-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 8)}`;
      const blockchain_record = {
        timestamp: new Date().toISOString(), // Simulated timestamp
      };

      return Response.json({
        success: true,
        response: {
          message: `Your ${documentType} has been securely uploaded and processed using WICchain technology.`,
          wicchain_id: wicchainId,
          reference_id: documentId,
          timestamp: blockchain_record['timestamp'],
        }
      }, { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    } catch (error) {
      console.error('File upload error:', error);
      return Response.json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, { status: 500 });
    }
  } else {
    // Handle JSON document saving logic
    try {
      if (!id) {
        return new Response('Missing id', { status: 400 });
      }
      
      const {
        content,
        title,
        kind,
      }: { content: string; title: string; kind: ArtifactKind } =
        await request.json();
    
      const documents = await getDocumentsById({ id });
    
      if (documents.length > 0) {
        const [document] = documents;
    
        if (document.userId !== session.user.id) {
          return new Response('Forbidden', { status: 403 });
        }
      }
    
      const document = await saveDocument({
        id,
        content,
        title,
        kind,
        userId: session.user.id,
      });
    
      return Response.json({
        success: true,
        response: {
          message: 'Document saved successfully.',
          document: document
        }
      }, { status: 200 });
    } catch (error) {
      console.error('JSON document save error:', error);
      return Response.json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, { status: 500 });
    }
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const timestamp = searchParams.get('timestamp');

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  if (!timestamp) {
    return new Response('Missing timestamp', { status: 400 });
  }

  const session = await auth();

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const documents = await getDocumentsById({ id });

  const [document] = documents;

  if (document.userId !== session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const documentsDeleted = await deleteDocumentsByIdAfterTimestamp({
    id,
    timestamp: new Date(timestamp),
  });

  return Response.json(documentsDeleted, { status: 200 });
}