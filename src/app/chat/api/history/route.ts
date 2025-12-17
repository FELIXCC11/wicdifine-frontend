// src/app/chat/api/history/route.ts
import { auth } from '@/app/auth/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getChatsByUserId } from '@/libs/db/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Define types
interface HistoryItem {
  id: string;
  message?: string;
  timestamp?: string;
  role?: string;
}

interface HistoryResponse {
  chats: Array<{
    id: string;
    title: string;
    createdAt: string;
    visibility: string;
    messages: Array<{
      id: string;
      role: string;
      content: string;
    }>;
  }>;
  hasMore: boolean;
}

// Format response data
function adaptHistoryResponse(data: any): HistoryResponse {
  if (data && data.chats) {
    return data as HistoryResponse;
  }

  if (Array.isArray(data)) {
    return {
      chats: data.map((item: HistoryItem) => ({
        id: item.id || `chat-${Date.now()}`,
        title: item.message?.substring(0, 30) || 'Chat conversation',
        createdAt: item.timestamp || new Date().toISOString(),
        visibility: 'private',
        messages: [{
          id: item.id,
          role: item.role || 'user',
          content: item.message || ''
        }]
      })),
      hasMore: false
    };
  }

  // Return empty history for demo
  return {
    chats: [],
    hasMore: false
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const session = await auth();

    // Extract query parameters
    const limit = parseInt(searchParams.get('limit') || '10');
    const startingAfter = searchParams.get('starting_after');
    const endingBefore = searchParams.get('ending_before');

    // If we have a logged-in user, use the database history
    if (session?.user?.id) {
      try {
        // For authenticated users, use the database query
        if (startingAfter && endingBefore) {
          return NextResponse.json(
            { error: 'Only one of starting_after or ending_before can be provided!' },
            { status: 400 }
          );
        }

        const chats = await getChatsByUserId({
          id: session.user.id,
          limit,
          startingAfter,
          endingBefore,
        });

        return NextResponse.json(chats);
      } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch chats!' }, { status: 500 });
      }
    }

    // For guest users, return empty history
    return NextResponse.json({
      chats: [],
      hasMore: false
    });
  } catch (error) {
    // Return empty history to prevent UI errors
    return NextResponse.json({
      chats: [],
      hasMore: false
    });
  }
}