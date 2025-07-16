'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo } from 'react';
import { UseChatHelpers } from '@ai-sdk/react';

interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers['append'];
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  // WICFIN-specific suggested actions for loan-related questions
  const suggestedActions = [
    {
      title: 'What loan types',
      label: 'do you offer?',
      action: 'What loan types do you offer?',
    },
    {
      title: 'Tell me about',
      label: 'your interest rates',
      action: 'Tell me about your interest rates',
    },
    {
      title: 'How do I apply',
      label: 'for a personal loan?',
      action: 'How do I apply for a personal loan?',
    },
    {
      title: 'What documents',
      label: 'are required for a mortgage?',
      action: 'What documents are required for a mortgage?',
    },
    {
      title: 'How does',
      label: 'blockchain verification work?',
      action: 'How does blockchain verification work?',
    },
    {
      title: 'What are the',
      label: 'current lending terms?',
      action: 'What are the current lending terms?',
    },
  ];

  const handleSuggestionClick = (action: string) => {
    // Update the URL without reloading the page
    window.history.replaceState({}, '', `/chat/${chatId}`);

    // Add the message to the chat
    append({
      role: 'user',
      content: action,
    });
  };

  return (
    <div
      data-testid="suggested-actions"
      className="grid sm:grid-cols-3 gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 2 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={() => handleSuggestionClick(suggestedAction.action)}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start hover:bg-muted/50 transition-colors"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);