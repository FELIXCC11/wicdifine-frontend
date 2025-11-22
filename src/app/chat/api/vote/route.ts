import { NextResponse } from 'next/server';
import { getChatById, getVotesByChatId, voteMessage } from '@/libs/db/queries';
import { auth } from '@/app/auth/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('chatId is required', { status: 400 });
  }

  try {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return new Response('Unauthorized', { status: 401 });
    }

    const chat = await getChatById({ id: chatId });

    if (!chat) {
      return new Response('Chat not found', { status: 404 });
    }

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const votes = await getVotesByChatId({ id: chatId });
    return NextResponse.json(votes, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get votes' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { chatId, messageId, isUpvoted } = await request.json();

    if (!chatId || !messageId) {
      return new Response('chatId and messageId are required', { status: 400 });
    }

    const chat = await getChatById({ id: chatId });

    if (!chat) {
      return new Response('Chat not found', { status: 404 });
    }

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await voteMessage({
      chatId,
      messageId,
      isUpvoted,
    });

    return new Response('Message voted', { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to vote message' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return PATCH(request);
}