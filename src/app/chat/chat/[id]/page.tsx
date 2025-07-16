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

  // Convert DB messages to the simplified format
  function convertToSimplifiedMessages(messages: Array<Message>): Array<SimplifiedMessage> {
    return messages.map((message) => {
      const simplifiedMessage: SimplifiedMessage = {
        id: message.id,
        role: message.role as 'user' | 'assistant',
        content: '',
      };
      
      if (message.parts && Array.isArray(message.parts)) {
        simplifiedMessage.content = message.parts.map(part => 
          typeof part === 'string' ? part : JSON.stringify(part)
        ).join('');
      }
      
      if (message.createdAt) {
        simplifiedMessage.createdAt = message.createdAt;
      }
      
      return simplifiedMessage;
    });
  }

  return (
    <SimplifiedChat
      id={chat.id}
      initialMessages={convertToSimplifiedMessages(messagesFromDb)}
    />
  );
}