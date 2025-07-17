'use client';

import { Button } from './ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useEffect } from 'react';
import type { ArtifactKind } from './artifact';

// Interface for the UISuggestion used by the editor
interface UISuggestionType {
  id: string;
  originalText: string;
  suggestedText: string;
  selectionStart: number;
  selectionEnd: number;
}

// Props for the individual Suggestion component used by the editor
interface SuggestionProps {
  suggestion: UISuggestionType;
  onApply: () => void;
  artifactKind?: ArtifactKind;
}

// Individual Suggestion component for editor use
export function Suggestion({ suggestion, onApply, artifactKind = 'text' }: SuggestionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs border border-blue-200 dark:border-blue-800"
    >
      <span className="font-medium">Suggestion:</span>
      <span className="text-blue-600 dark:text-blue-400">
        "{suggestion.originalText}" → "{suggestion.suggestedText}"
      </span>
      <Button
        size="sm"
        variant="ghost"
        className="h-4 w-4 p-0 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
        onClick={onApply}
      >
        ✓
      </Button>
    </motion.div>
  );
}

// Interface for chat action suggestions
interface SuggestedActionsProps {
  onActionClick: (action: string) => void;
  actions?: Array<{
    title: string;
    message: string;
  }>;
}

// Chat action suggestions component
export function SuggestedActions({ onActionClick, actions = [] }: SuggestedActionsProps) {
  // If no actions provided, use these default ones
  const defaultActions = [
    {
      title: 'What loan types do you offer?',
      message: 'What loan types do you offer?'
    },
    {
      title: 'Interest Rates',
      message: 'Tell me about your interest rates'
    },
    {
      title: 'Apply for a Loan',
      message: 'How do I apply for a personal loan?'
    },
    {
      title: 'Blockchain Security',
      message: 'How does blockchain verification work?'
    },
    {
      title: 'Required Documents',
      message: 'What documents are required for a mortgage?'
    },
    {
      title: 'Current Terms',
      message: 'What are the current lending terms?'
    }
  ];

  const suggestionsToShow = actions.length > 0 ? actions : defaultActions;
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle horizontal scrolling with mouse wheel
  useEffect(() => {
    const container = containerRef.current;
    
    const handleWheel = (e: WheelEvent) => {
      if (container) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container?.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container?.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="w-full flex justify-center"
      >
        <div 
          className="w-full grid grid-cols-2 gap-2 mt-4 pb-1"
          style={{ maxWidth: "800px" }} // Match input container max-width
        >
          {suggestionsToShow.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: 0.1 * index }
              }}
              className="w-full"
            >
              <Button
                variant="outline"
                className="w-full h-auto py-3 text-sm rounded-md"
                onClick={() => onActionClick(action.message)}
              >
                {action.title}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}