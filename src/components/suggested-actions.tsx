'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo } from 'react';
import { UseChatHelpers } from '@ai-sdk/react';

interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers['append'];
  onAction?: (action: string) => void;
}

function PureSuggestedActions({ chatId, append, onAction }: SuggestedActionsProps) {
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
    onAction?.(action);
  };

  return (
    <div
      data-testid="suggested-actions"
      className="flex flex-wrap items-center justify-center gap-3"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className="w-full sm:w-auto"
        >
          <Button
            variant="ghost"
            onClick={() => handleSuggestionClick(suggestedAction.action)}
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-white/75 hover:border-white/30 hover:bg-white/5"
          >
            <span>{suggestedAction.title}</span>
            <span className="text-white/50 group-hover:text-white/70">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
