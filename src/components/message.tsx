'use client';

import type { UIMessage } from 'ai';
import { motion } from 'framer-motion';
import { memo, useState } from 'react';
import type { Vote } from '@/libs/db/schema';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { MessageEditor } from './message-editor';
import type { UseChatHelpers } from '@ai-sdk/react';
import { formatDistanceToNow } from 'date-fns';

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
}: {
  chatId: string;
  message: UIMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers['setMessages'];
  reload: UseChatHelpers['reload'];
  isReadonly: boolean;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const isUserMessage = message.role === 'user';

  const getTextContent = (): string => {
    let content = '';

    if (message.content && typeof message.content === 'string') {
      content = message.content;
    } else if (Array.isArray(message.parts)) {
      const textParts = message.parts
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text || part.content || '')
        .filter(Boolean);

      if (textParts.length > 0) {
        content = textParts.join('\n');
      }
    }

    // Convert literal \n strings to actual newlines
    // This handles cases where the AI returns escaped newlines as text
    content = content.replace(/\\n/g, '\n');

    return content;
  };

  const textContent = getTextContent();

  // Format timestamp
  const getTimestamp = () => {
    if (!message.createdAt) return '';
    try {
      return formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
    } catch {
      return '';
    }
  };

  if (mode === 'edit') {
    return (
      <div className="w-full mb-6">
        <MessageEditor
          key={message.id}
          message={message}
          setMode={setMode}
          setMessages={setMessages}
          reload={reload}
        />
      </div>
    );
  }

  // Don't hide empty messages during loading
  if (!textContent && !isLoading) {
    return null;
  }

  return (
    <div
      data-testid={`message-${message.role}`}
      className="w-full mb-8"
      data-role={message.role}
    >
      {isUserMessage ? (
        // User message - right aligned with grey background
        <div className="flex justify-end w-full">
          <div className="flex flex-col items-end max-w-[70%]">
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-2">
              <span className="font-medium">Me</span>
              {getTimestamp() && (
                <>
                  <span>·</span>
                  <span>{getTimestamp()}</span>
                </>
              )}
            </div>
            <div
              data-testid="message-content"
              className="bg-[#1a1d24] text-gray-200 rounded-2xl px-4 py-3 whitespace-pre-wrap break-words border border-gray-700/50"
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui",
                fontSize: '15px',
                lineHeight: '1.5',
              }}
            >
              {textContent}
            </div>
          </div>
        </div>
      ) : (
        // AI message - left aligned, clean text
        <div className="w-full">
          <div className="flex flex-col items-start">
            <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
              <span className="font-medium">Data Agent</span>
              {getTimestamp() && (
                <>
                  <span>·</span>
                  <span>{getTimestamp()}</span>
                </>
              )}
            </div>
            <div
              data-testid="message-content"
              className="w-full text-gray-200 prose prose-sm max-w-none"
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui",
                fontSize: '15px',
                lineHeight: '1.65',
              }}
            >
              <Markdown>{textContent}</Markdown>
            </div>

            {/* Message actions */}
            {!isReadonly && textContent && (
              <div className="mt-4">
                <MessageActions
                  key={`action-${message.id}`}
                  chatId={chatId}
                  message={message}
                  vote={vote}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (prevProps.message.content !== nextProps.message.content) return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  return (
    <div
      data-testid="message-assistant-loading"
      className="w-full mb-8"
      data-role="assistant"
    >
      <div className="flex flex-col items-start">
        <div className="text-xs text-gray-500 mb-2 font-medium">
          Data Agent
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <div className="flex gap-1">
            <motion.div
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0,
              }}
            />
            <motion.div
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.1,
              }}
            />
            <motion.div
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.2,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
