import type { UIMessage } from 'ai';
import { PreviewMessage, ThinkingMessage } from './message';
import { useScrollToBottom } from './use-scroll-to-bottom';
import { memo } from 'react';
import type { Vote } from '@/libs/db/schema';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import { EmptyState } from './empty-state';

interface MessagesProps {
  chatId: string;
  messages: Array<UIMessage>;
  setMessages?: UseChatHelpers['setMessages'];
  reload?: UseChatHelpers['reload'];
  isLoading?: boolean;
  stop?: () => void;
  append?: any;
  votes?: Array<Vote> | undefined;
  isReadonly?: boolean;
  isArtifactVisible?: boolean;
}

function PureMessages({
  chatId,
  messages,
  setMessages,
  reload,
  isLoading = false,
  votes,
  isReadonly = false,
}: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div
      ref={messagesContainerRef}
      className="flex min-h-0 flex-1 flex-col gap-0 py-8 overflow-y-auto"
    >
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="max-w-4xl w-full mx-auto px-6">
          {messages.map((message, index) => (
            <PreviewMessage
              key={message.id}
              chatId={chatId}
              message={message}
              isLoading={isLoading && messages.length - 1 === index}
              vote={
                votes
                  ? votes.find((vote) => vote.messageId === message.id)
                  : undefined
              }
              setMessages={setMessages || (() => {})}
              reload={reload || (async () => null)}
              isReadonly={isReadonly}
            />
          ))}

          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>
      )}
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) return true;

  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return true;
});