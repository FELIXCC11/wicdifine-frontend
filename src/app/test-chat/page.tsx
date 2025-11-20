'use client';
import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/libs/ai/models';

export default function TestChatPage() {
  return (
    <Chat
      id="test-123"
      initialMessages={[]}
      selectedChatModel={DEFAULT_CHAT_MODEL}
      selectedVisibilityType="private"
      isReadonly={false}
    />
  );
}