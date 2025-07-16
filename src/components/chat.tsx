'use client';

import type { Attachment, UIMessage } from 'ai';
import { useState, useEffect } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/libs/db/schema';
import { fetcher, generateUUID } from '@/libs/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import type { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { toast } from 'sonner';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from './sidebar-history';

// Helper functions to make our types compatible with AI SDK
function toUIMessage(message: {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}): UIMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt,
    parts: [{
      type: 'text',
      text: message.content
    }]
  } as UIMessage;
}


function getCompatibleStatus(status: 'in_progress' | 'awaiting_message'): 'streaming' | 'submitted' | 'ready' | 'error' {
  if (status === 'in_progress') return 'streaming';
  return 'ready';
}

export function Chat({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();
  const [messages, setMessages] = useState<Array<UIMessage>>(initialMessages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  // For compatibility with the Messages component
  const rawStatus = isLoading ? 'in_progress' : 'awaiting_message';
  const status = getCompatibleStatus(rawStatus);

  // Add debugging to monitor messages
  useEffect(() => {
    console.log("Current messages:", JSON.stringify(messages, null, 2));
  }, [messages]);

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );

  // Custom submit handler that uses direct API call instead of streaming
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

  
    const userMessage = toUIMessage({
      id: generateUUID(),
      role: 'user',
      content: input,
      createdAt: new Date(),
    });

    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      const isDuplicateUser = 
        lastMessage?.role === 'user' && 
        lastMessage.content === userMessage.content;
        
      return isDuplicateUser ? prev : [...prev, userMessage];
    });

    setInput('');
    setIsLoading(true);

    try {
      // Call our direct API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          chatId: id,
          model: selectedChatModel,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Extract message from the response
      let assistantContent = '';
      if (data.success && data.response && data.response.message) {
        assistantContent = data.response.message;
      } else {
        throw new Error('Invalid response format');
      }

      // Add assistant message to state with compatibility conversion
      const assistantMessage = toUIMessage({
        id: generateUUID(),
        role: 'assistant',
        content: assistantContent,
        createdAt: new Date(),
      });

      setMessages((prev) => [...prev, assistantMessage]);
      
      // For compatibility with existing code
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get response from the loan assistant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to stop generation (dummy for compatibility)
  const stop = () => {
    setIsLoading(false);
  };

  // Function to reload messages - returns a Promise<string> for compatibility
  const reload = async (): Promise<string | null> => {
    // Implementation if needed
    return null;
  };

  // Append function for compatibility
  const append = async (message: UIMessage | any) => {
    // If it's already a UIMessage, just add it
    if (message.parts) {
      setMessages((prev) => [...prev, message]);
    } else {
      // Otherwise convert it
      setMessages((prev) => [...prev, toUIMessage(message as any)]);
    }
    return null;
  };

  return (
    <>
      <div className="flex flex-col min-w-0 h-full bg-background relative">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages}
          setMessages={setMessages as any}
          reload={reload as any}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
        />

        <form className="sticky bottom-0 z-10 bg-background/90 backdrop-blur-md flex mx-auto px-4 pb-4 pt-2 -mt-1 gap-2 w-full md:max-w-3xl" onSubmit={handleSubmit}>
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit as any}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages as any}
              append={append as any}
            />
          )}
        </form>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit as any}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append as any}
        messages={messages}
        setMessages={setMessages as any}
        reload={reload as any}
        votes={votes}
        isReadonly={isReadonly}
      />
    </>
  );
}