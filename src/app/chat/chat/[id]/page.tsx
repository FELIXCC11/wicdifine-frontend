// src/app/chat/chat/[id]/page.tsx
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/app/auth/auth';
import { SimplifiedChat } from '@/components/simplified-chat';
import { getChatById, getMessagesByChatId } from '@/libs/db/queries';
import { Message } from '@/libs/db/schema';

interface SimplifiedMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const session = await auth();

  if (chat.visibility === 'private') {
    if (!session || !session.user) {
      return notFound();
    }

    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  // Convert DB messages to the format expected by SimplifiedChat
function convertToSimplifiedMessages(messages: Array<Message>): Array<any> {
  return messages.map((message) => {
    const convertedMessage = {
      id: message.id,
      role: message.role as 'user' | 'assistant',
      createdAt: message.createdAt,
      parts: [
        {
          type: 'text',
          text: ''
        }
      ]
    };
    
    if (message.parts && Array.isArray(message.parts)) {
      convertedMessage.parts[0].text = message.parts.map(part => 
        typeof part === 'string' ? part : JSON.stringify(part)
      ).join('');
    }
    
    return convertedMessage;
  });
}}