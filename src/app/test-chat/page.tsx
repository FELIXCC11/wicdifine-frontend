'use client';
import { SimplifiedChat } from '@/components/simplified-chat';

export default function TestChatPage() {
  return (
    <SimplifiedChat
      id="test-123"
      initialMessages={[]}
    />
  );
}