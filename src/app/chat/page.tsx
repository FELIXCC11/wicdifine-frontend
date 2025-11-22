import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/app/auth/auth';

import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/libs/ai/models';
import { generateUUID } from '@/libs/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');

  if (!modelIdFromCookie) {
    return (
      <>
        <Chat
          key={id}
          id={id}
          initialMessages={[]}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          selectedVisibilityType="private"
          isReadonly={false}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedChatModel={modelIdFromCookie.value}
        selectedVisibilityType="private"
        isReadonly={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}