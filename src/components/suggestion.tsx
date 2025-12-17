'use client';

import { Button } from './ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useEffect } from 'react';

interface SuggestedActionsProps {
  onActionClick: (action: string) => void;
  actions?: Array<{
    title: string;
    message: string;
  }>;
}

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