'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useWindowSize } from 'usehooks-ts';

import type { UISuggestion as EditorSuggestion  } from '../libs/editor/suggestions';

import { CrossIcon, MessageIcon } from './icons';
import { Button } from './ui/button';
import { cn } from '.././libs/utils';
import { ArtifactKind } from './artifact';

export const Suggestion = ({
  suggestion,
  onApply,
  artifactKind,
}: {
  suggestion: UISuggestion;
  onApply: () => void;
  artifactKind: ArtifactKind;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { width: windowWidth } = useWindowSize();

  return (
    <AnimatePresence>
      {!isExpanded ? (
        <motion.div
          className={cn('cursor-pointer text-muted-foreground p-1', {
            'absolute -right-8': artifactKind === 'text',
            'sticky top-0 right-4': artifactKind === 'code',
          })}
          onClick={() => {
            setIsExpanded(true);
          }}
          whileHover={{ scale: 1.1 }}
        >
          <MessageIcon size={windowWidth && windowWidth < 768 ? 16 : 14} />
        </motion.div>
      ) : (
        <motion.div
          key={suggestion.id}
          className="absolute bg-background p-3 flex flex-col gap-3 rounded-2xl border text-sm w-56 shadow-xl z-50 -right-12 md:-right-16 font-sans"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: -20 }}
          exit={{ opacity: 0, y: -10 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <div className="size-4 bg-muted-foreground/25 rounded-full" />
              <div className="font-medium">Assistant</div>
            </div>
            <button
              type="button"
              className="text-xs text-gray-500 cursor-pointer"
              onClick={() => {
                setIsExpanded(false);
              }}
            >
              <CrossIcon size={12} />
            </button>
          </div>
          <div>{suggestion.description}</div>
          <Button
            variant="outline"
            className="w-fit py-1.5 px-3 rounded-full"
            onClick={onApply}
          >
            Apply
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export interface UISuggestion {
    id: string;
    description: string | null;
    originalText: string;
    suggestedText: string;
    selectionStart?: number; // Make optional
    selectionEnd?: number;   // Make optional
    // Add any other required fields
  }

export interface EditorProps {
    content: string;
    isCurrentVersion: boolean;
    currentVersionIndex: number;
    status: 'streaming' | 'idle';
    saveContent: (content: string, debounce: boolean) => void;
    suggestions: UISuggestion[];
    onSaveContent?: (content: string) => void;
    mode?: 'edit' | 'diff';
    isInline?: boolean;
  }

  export const Editor = ({
    content,
    isCurrentVersion,
    currentVersionIndex,
    status,
    saveContent,
    suggestions = [],
    onSaveContent,
    mode = 'edit',
    isInline = false,
  }: EditorProps) => {
    const [localContent, setLocalContent] = useState(content);
    
    useEffect(() => {
      setLocalContent(content);
    }, [content, currentVersionIndex]);
  
    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setLocalContent(newContent);
      
      if (onSaveContent) {
        onSaveContent(newContent);
      }
      
      if (isCurrentVersion && status !== 'streaming') {
        saveContent(newContent, true);
      }
    }, [isCurrentVersion, onSaveContent, saveContent, status]);
  
    // Auto-resize textarea based on content
    const textareaRef = useCallback((textareaElement: HTMLTextAreaElement | null) => {
      if (textareaElement) {
        textareaElement.style.height = 'auto';
        textareaElement.style.height = `${textareaElement.scrollHeight}px`;
      }
    }, []);
  
    return (
      <div className={cn(
        "w-full prose dark:prose-invert max-w-full relative",
        isInline ? "prose-sm" : "prose-lg"
      )}>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={handleChange}
            disabled={!isCurrentVersion || status === 'streaming'}
            className={cn(
              "w-full resize-none overflow-hidden bg-transparent outline-none",
              "min-h-[200px] text-foreground placeholder:text-muted-foreground",
              !isCurrentVersion && "opacity-70"
            )}
            placeholder="Start typing..."
          />
          
          {suggestions.length > 0 && (
            <div className="absolute top-0 right-0 space-y-2">
              {suggestions.map(suggestion => (
                <Suggestion
                  key={suggestion.id}
                  suggestion={suggestion}
                  onApply={() => {
                    // Apply suggestion logic
                    const newContent = localContent.replace(
                      suggestion.originalText,
                      suggestion.suggestedText
                    );
                    setLocalContent(newContent);
                    if (onSaveContent) onSaveContent(newContent);
                    saveContent(newContent, false);
                  }}
                  artifactKind="text"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };