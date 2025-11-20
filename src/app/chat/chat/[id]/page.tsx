
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { UIMessage } from 'ai';

import { auth } from '@/app/auth/auth';
import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId } from '@/libs/db/queries';
import { Message } from '@/libs/db/schema';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  console.log('✅ USING NEW PAGE.TSX');
  
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

  function convertToUIMessages(messages: Array<Message>): Array<UIMessage> {
    return messages.map((message) => {
      let content = '';

      if (message.parts && Array.isArray(message.parts)) {
        content = message.parts.map(part =>
          typeof part === 'string' ? part : JSON.stringify(part)
        ).join('');
      }

      const uiMessage: UIMessage = {
        id: message.id,
        role: message.role as 'user' | 'assistant',
        content: content,
        parts: [{
          type: 'text',
          text: content
        }]
      };

      if (message.createdAt) {
        uiMessage.createdAt = message.createdAt;
      }

      return uiMessage;
    });
  }

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const selectedModelId = modelIdFromCookie || 'gpt-4';

  return (
    <Chat
      id={chat.id}
      initialMessages={convertToUIMessages(messagesFromDb)}
      selectedChatModel={selectedModelId}
      selectedVisibilityType={chat.visibility || 'private'}
      isReadonly={session?.user?.id !== chat.userId}
    />
  );
}