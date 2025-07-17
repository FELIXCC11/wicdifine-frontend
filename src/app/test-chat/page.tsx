'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import { SimplifiedChat } from '@/components/simplified-chat';

export default function TestChatPage() {
  return (
    <SidebarProvider>
      <SimplifiedChat
        id="test-123"
        initialMessages={[]}
      />
    </SidebarProvider>
  );
}