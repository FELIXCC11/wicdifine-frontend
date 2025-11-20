'use client';

import type { Attachment, UIMessage } from 'ai';
import cx from 'classnames';
import type React from 'react';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';

import { ArrowUpIcon, PaperclipIcon } from './icons';
import { PreviewAttachment } from './preview-attachment';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import { Mic, ChevronDown } from 'lucide-react';

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  handleSubmit,
  append,
  className,
}: {
  chatId: string;
  input: UseChatHelpers['input'];
  setInput: UseChatHelpers['setInput'];
  status: UseChatHelpers['status'];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers['setMessages'];
  handleSubmit: UseChatHelpers['handleSubmit'];
  append?: UseChatHelpers['append'];
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  const [isDragging, setIsDragging] = useState(false);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '50px';
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    window.history.replaceState({}, '', `/chat/${chatId}`);

    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });

    setAttachments([]);
    setLocalStorageInput('');
    resetHeight();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    attachments,
    handleSubmit,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
  ]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', 'general');

    try {
      const response = await fetch('/chat/api/document', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('File uploaded successfully!');
        return {
          url: data.url || file.name,
          name: data.pathname || file.name,
          contentType: data.contentType || file.type,
        };
      }

      const errorData = await response.json();
      toast.error(errorData.error || 'Failed to upload file');
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to upload file, please try again!');
    }
    return undefined;
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        setUploadQueue(files.map((file) => file.name));

        const uploadPromises = files.map((file) => uploadFile(file));
        Promise.all(uploadPromises)
          .then((uploadedAttachments) => {
            const successfullyUploadedAttachments = uploadedAttachments.filter(
              (attachment) => attachment !== undefined,
            );

            setAttachments((currentAttachments) => [
              ...currentAttachments,
              ...successfullyUploadedAttachments,
            ]);
          })
          .catch((error) => {
            console.error('Error uploading files!', error);
          })
          .finally(() => {
            setUploadQueue([]);
          });
      }
    },
    [setAttachments, setUploadQueue, uploadFile],
  );

  return (
    <div className="w-full flex flex-col gap-4">
      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {/* Main input container */}
      <div
        className="relative w-full"
        ref={dropAreaRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 border-2 border-dashed border-gray-600 rounded-2xl bg-gray-800 flex items-center justify-center z-50">
            <div className="text-gray-300 font-medium">
              Drop files here to upload
            </div>
          </div>
        )}

        <div className="bg-gray-700/30 backdrop-blur-lg border border-gray-600/40 rounded-2xl shadow-lg hover:bg-gray-700/40 hover:border-gray-500/50 transition-all">
          <Textarea
            data-testid="multimodal-input"
            ref={textareaRef}
            placeholder="Message AI Chat..."
            value={input}
            onChange={handleInput}
            className={cx(
              'min-h-[56px] max-h-[200px] py-4 px-5 overflow-hidden resize-none !text-[15px] bg-transparent text-gray-100 placeholder:text-gray-500 border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
              className,
            )}
            rows={1}
            style={{
              fontFamily:
                "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui",
            }}
            autoFocus
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();

                if (status !== 'ready') {
                  toast.error('Please wait for the model to finish its response!');
                } else {
                  submitForm();
                }
              }
            }}
          />
        </div>
      </div>

      {/* Action buttons row */}
      <div className="flex items-center justify-between px-1 md:px-2">
        <div className="flex items-center gap-1 md:gap-2">
          {/* Attachment button */}
          <Button
            data-testid="attachments-button"
            type="button"
            className="h-8 md:h-9 px-2 md:px-3 rounded-lg bg-transparent hover:bg-gray-800/50 text-gray-400 hover:text-gray-300 border-0"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              fileInputRef.current?.click();
            }}
            disabled={status !== 'ready'}
            variant="ghost"
          >
            <span className="md:w-[18px] md:h-[18px] flex items-center justify-center">
              <PaperclipIcon size={16} />
            </span>
          </Button>

          {/* Search the web button */}
          <Button
            className="h-8 md:h-9 px-2 md:px-4 rounded-lg bg-transparent hover:bg-gray-800/50 text-gray-400 hover:text-gray-300 border border-gray-700/50 hover:border-gray-600/50"
            variant="ghost"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-4 md:h-4 md:mr-2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <span className="text-xs md:text-sm hidden md:inline">Search the web</span>
          </Button>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {/* Voice input */}
          <Button
            className="h-8 md:h-9 w-8 md:w-9 rounded-lg bg-transparent hover:bg-gray-800/50 text-gray-400 hover:text-gray-300 p-0"
            variant="ghost"
          >
            <Mic size={16} className="md:w-[18px] md:h-[18px]" />
          </Button>

          {/* Send button - glass style with white arrow */}
          <Button
            data-testid="send-button"
            type="button"
            className="h-8 md:h-9 w-8 md:w-9 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/30 shadow-lg p-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (input.length > 0 && uploadQueue.length === 0 && status === 'ready') {
                submitForm();
              }
            }}
            disabled={input.length === 0 || uploadQueue.length > 0 || status !== 'ready'}
          >
            <ArrowUpIcon size={16} className="text-white md:w-[18px] md:h-[18px]" />
          </Button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-[10px] md:text-xs text-gray-500 text-center px-2 md:px-4 -mt-2">
        WICFIN might not be able to give a perfect response regarding financial advice. Always consult with a professional.
      </div>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.status !== nextProps.status) return false;
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;

    return true;
  },
);
