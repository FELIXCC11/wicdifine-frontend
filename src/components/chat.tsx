// ⭐⭐⭐ UPDATED FILE - CHECK CONSOLE FOR "🚀 NEW CHAT.TSX" ⭐⭐⭐
'use client';

import type { Attachment, UIMessage } from 'ai';
import { useState } from 'react';
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
import { Sidebar } from './sidebar';

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
  console.log('🚀 NEW CHAT.TSX LOADED');
  
  const { mutate } = useSWRConfig();
  const [messages, setMessages] = useState<Array<UIMessage>>(initialMessages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  const rawStatus = isLoading ? 'in_progress' : 'awaiting_message';
  const status = getCompatibleStatus(rawStatus);

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );

  const handleSubmit = async (e?: React.FormEvent) => {
    console.log('📤 SUBMIT TRIGGERED');
    if (e) e.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) {
      console.log('⚠️ Skipping - no input or already loading');
      return;
    }

    console.log('✅ Creating user message:', trimmedInput);
    const userMessage = toUIMessage({
      id: generateUUID(),
      role: 'user',
      content: trimmedInput,
      createdAt: new Date(),
    });

    // Update messages state immediately with functional update
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      console.log('🌐 Calling Next.js API...');
      console.log('📦 Sending chat history:', updatedMessages.length, 'messages');

      // Convert UIMessage format to API messages format
      const apiMessages = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content || (msg.parts?.[0] as any)?.text || '',
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          chatId: id,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to get response');
      }

      // Prepare for streaming with real-time updates
      const assistantId = generateUUID();
      const createdAt = new Date();
      let assistantContent = '';
      let messageAdded = false;

      // Handle streaming response from Next.js API with real-time updates
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('0:')) {
              // Text chunk from streaming API
              const text = line.substring(2).replace(/^"(.*)"$/, '$1');
              assistantContent += text;

              if (!messageAdded) {
                // Add assistant message on first chunk
                const assistantMessage = toUIMessage({
                  id: assistantId,
                  role: 'assistant',
                  content: assistantContent,
                  createdAt: createdAt,
                });
                setMessages((prev) => [...prev, assistantMessage]);
                messageAdded = true;
                console.log('📝 Started streaming assistant message:', assistantId);
              } else {
                // Update message in real-time as chunks arrive
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? toUIMessage({
                          id: assistantId,
                          role: 'assistant',
                          content: assistantContent,
                          createdAt: createdAt,
                        })
                      : msg
                  )
                );
              }
            }
          }
        }
      }

      if (!assistantContent) {
        console.error('❌ No assistant content! Empty response from API');
        throw new Error('No response received from API');
      }

      console.log('✅ Streaming complete:', {
        length: assistantContent.length,
        preview: assistantContent.substring(0, 100) + '...'
      });

      mutate(unstable_serialize(getChatHistoryPaginationKey));

    } catch (error) {
      console.error('❌ Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to get response';
      toast.error(errorMsg);

      const errorMessage = toUIMessage({
        id: generateUUID(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        createdAt: new Date(),
      });

      setMessages((prev) => [...prev, errorMessage]);

    } finally {
      setIsLoading(false);
      console.log('✅ Loading complete');
    }
  };

  const stop = () => {
    setIsLoading(false);
  };

  const reload = async (): Promise<string | null> => {
    return null;
  };

  const append = async (message: UIMessage | any) => {
    console.log('📤 APPEND TRIGGERED (suggestion clicked)');

    if (isLoading) {
      console.log('⚠️ Already loading, skipping');
      return null;
    }

    const userMessage = message.parts ? message : toUIMessage(message as any);
    const messageContent = userMessage.content || '';

    if (!messageContent.trim()) {
      console.log('⚠️ Empty message, skipping');
      return null;
    }

    // Update messages state immediately with functional update
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      console.log('🌐 Calling Next.js API (from append)...');
      console.log('📦 Sending chat history:', updatedMessages.length, 'messages');

      // Convert UIMessage format to API messages format
      const apiMessages = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content || (msg.parts?.[0] as any)?.text || '',
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          chatId: id,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to get response');
      }

      // Prepare for streaming with real-time updates
      const assistantId = generateUUID();
      const createdAt = new Date();
      let assistantContent = '';
      let messageAdded = false;

      // Handle streaming response from Next.js API with real-time updates
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('0:')) {
              // Text chunk from streaming API
              const text = line.substring(2).replace(/^"(.*)"$/, '$1');
              assistantContent += text;

              if (!messageAdded) {
                // Add assistant message on first chunk
                const assistantMessage = toUIMessage({
                  id: assistantId,
                  role: 'assistant',
                  content: assistantContent,
                  createdAt: createdAt,
                });
                setMessages((prev) => [...prev, assistantMessage]);
                messageAdded = true;
                console.log('📝 Started streaming assistant message (append):', assistantId);
              } else {
                // Update message in real-time as chunks arrive
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? toUIMessage({
                          id: assistantId,
                          role: 'assistant',
                          content: assistantContent,
                          createdAt: createdAt,
                        })
                      : msg
                  )
                );
              }
            }
          }
        }
      }

      if (!assistantContent) {
        throw new Error('No response received from API');
      }

      console.log('✅ Streaming complete (append)');
      mutate(unstable_serialize(getChatHistoryPaginationKey));

    } catch (error) {
      console.error('❌ Error in append:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to get response';
      toast.error(errorMsg);

      const errorMessage = toUIMessage({
        id: generateUUID(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        createdAt: new Date(),
      });

      setMessages((prev) => [...prev, errorMessage]);

    } finally {
      setIsLoading(false);
      console.log('✅ Append complete');
    }

    return null;
  };

  return (
    <div className="flex h-screen bg-[#1a1a1a]">
      <Sidebar />

      <div className="flex flex-1 flex-col min-w-0 h-full bg-[#1a1a1a] relative overflow-hidden">
        {/* Top-down shine effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-white/[0.03] via-white/[0.01] to-transparent blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col flex-1 min-h-0">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          messages={messages}
          setMessages={setMessages as any}
          reload={reload as any}
          isLoading={isLoading}
          votes={votes}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
        />

        <div className="sticky bottom-0 z-10 bg-[#1a1a1a]">
          {/* Suggestion cards - only show when no messages */}
          {messages.length === 0 && (
            <div className="w-full max-w-4xl mx-auto px-3 md:px-6 pb-3 md:pb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    const message = toUIMessage({
                      id: generateUUID(),
                      role: 'user',
                      content: 'Help me find the best personal loan rates and terms for my situation',
                      createdAt: new Date(),
                    });
                    append(message);
                  }}
                  className="bg-gray-700/30 backdrop-blur-lg border border-gray-600/40 rounded-xl p-4 md:p-6 hover:bg-gray-700/40 hover:border-gray-500/50 transition-all cursor-pointer"
                >
                  <h3 className="text-white font-semibold mb-1 md:mb-2 text-sm md:text-base">Find Loan Options</h3>
                  <p className="text-gray-400 text-xs md:text-sm">
                    Discover personalized lending options that match your financial goals
                  </p>
                </div>

                <div
                  onClick={(e) => {
                    e.preventDefault();
                    const message = toUIMessage({
                      id: generateUUID(),
                      role: 'user',
                      content: 'Explain different types of loans and which one would be best for me',
                      createdAt: new Date(),
                    });
                    append(message);
                  }}
                  className="bg-gray-700/30 backdrop-blur-lg border border-gray-600/40 rounded-xl p-4 md:p-6 hover:bg-gray-700/40 hover:border-gray-500/50 transition-all cursor-pointer"
                >
                  <h3 className="text-white font-semibold mb-1 md:mb-2 text-sm md:text-base">Loan Education</h3>
                  <p className="text-gray-400 text-xs md:text-sm">
                    Learn about personal, auto, home, and business loans to make informed decisions
                  </p>
                </div>

                <div
                  onClick={(e) => {
                    e.preventDefault();
                    const message = toUIMessage({
                      id: generateUUID(),
                      role: 'user',
                      content: 'Calculate my monthly payments and total interest for a loan',
                      createdAt: new Date(),
                    });
                    append(message);
                  }}
                  className="bg-gray-700/30 backdrop-blur-lg border border-gray-600/40 rounded-xl p-4 md:p-6 hover:bg-gray-700/40 hover:border-gray-500/50 transition-all cursor-pointer"
                >
                  <h3 className="text-white font-semibold mb-1 md:mb-2 text-sm md:text-base">Loan Calculator</h3>
                  <p className="text-gray-400 text-xs md:text-sm">
                    Calculate monthly payments, interest rates, and total cost of your loan
                  </p>
                </div>
              </div>
            </div>
          )}

          <form
            className="flex mx-auto px-3 md:px-6 pb-3 md:pb-6 pt-3 md:pt-6 gap-2 w-full max-w-4xl"
            onSubmit={handleSubmit}
          >
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
        </div>
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
    </div>
  );
}