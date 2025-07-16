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

import { ArrowUpIcon, PaperclipIcon, StopIcon } from './icons';
import { PreviewAttachment } from './preview-attachment';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { SuggestedActions } from './suggested-actions';
import { WicVerification } from './wic-verification';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import Image from 'next/image';

// Simple WIC Verification badge for chat input
function WicBadge({ 
  onClick,
}: { 
  onClick?: () => void 
}) {
  return (
    <div 
      className="flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-colors p-1.5 rounded-md"
      onClick={onClick}
    >
      <Image 
        src="/Wichain.png" 
        alt="WICchain" 
        width={24} 
        height={24} 
        className="opacity-90 hover:opacity-100"
      />
    </div>
  );
}

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
  append,
  handleSubmit,
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
  append: UseChatHelpers['append'];
  handleSubmit: UseChatHelpers['handleSubmit'];
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  
  const [isDragging, setIsDragging] = useState(false);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const [wicVerificationExpanded, setWicVerificationExpanded] = useState(false);

  // Sample verification result - replace with API call in production
  const verificationResult = {
    verified: true,
    lastChecked: '5 minutes ago',
    details: {
      documentTotal: 3,
      verificationLevel: 'High',
      hashStrength: '256-bit'
    },
    blockchain: {
      txHash: '0x7bd...45a3',
      blockNumber: '15241523'
    }
  };

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
      textareaRef.current.style.height = '44px';
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      console.log('Attempting to upload to:', '/chat/api/document');
      const response = await fetch('/chat/api/document', {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Upload response data:', data);
        toast.success('File uploaded successfully!');
        return {
          url: data.url || file.name,
          name: data.pathname || file.name,
          contentType: data.contentType || file.type,
        };
      }

      console.error(`Upload failed with status: ${response.status}`);
      try {
        const errorData = await response.json();
        console.error('Error data:', errorData);
        toast.error(errorData.error || 'Failed to upload file');
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        toast.error(`Server error: ${response.status}`);
      }
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
  
  const handleDrop = useCallback((e: React.DragEvent) => {
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
  }, [setAttachments, setUploadQueue, uploadFile]);

  // Toggle WIC verification panel
  const toggleWicVerification = () => {
    setWicVerificationExpanded(!wicVerificationExpanded);
  };

  return (
    <div className="w-full">
      {/* Suggested actions at beginning of conversation */}
      {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 && (
          <SuggestedActions append={append} chatId={chatId} />
        )}

      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />
      
      {/* Attachments preview */}
      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div
          data-testid="attachments-preview"
          className="flex flex-row gap-2 overflow-x-auto items-end mb-2"
        >
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}

          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: '',
                name: filename,
                contentType: '',
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}
      
      {/* WIC Verification expanded panel */}
      {wicVerificationExpanded && (
        <div className="absolute left-4 bottom-16 z-10">
          <WicVerification 
            result={verificationResult} 
            applicationId={chatId}
            className="w-[240px] shadow-lg"
            onToggleCollapse={toggleWicVerification}
          />
        </div>
      )}
      
      {/* Main chat input container */}
      <div className="mt-3">
        <div 
          className="flex-1 relative"
          ref={dropAreaRef}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 border-2 border-dashed border-primary rounded-lg bg-primary/5 flex items-center justify-center z-50">
              <div className="text-primary font-medium">Drop files here to upload</div>
            </div>
          )}

          <div className="flex items-center px-3 py-2 bg-zinc-900 rounded-lg border border-zinc-800">
            {/* WIC Badge */}
            <WicBadge onClick={toggleWicVerification} />
            
            {/* Main input field */}
            <div className="relative flex-1 mx-1.5">
              <Textarea
                data-testid="multimodal-input"
                ref={textareaRef}
                placeholder="Send a message..."
                value={input}
                onChange={handleInput}
                className={cx(
                  'min-h-[40px] max-h-[calc(75dvh)] py-2 px-3 overflow-hidden resize-none rounded-md !text-base bg-zinc-900 border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
                  className,
                )}
                rows={1}
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

            {/* Attachment button */}
            <Button
              data-testid="attachments-button"
              className="p-1.5 size-9 rounded-full bg-transparent hover:bg-zinc-800"
              onClick={(event) => {
                event.preventDefault();
                fileInputRef.current?.click();
              }}
              disabled={status !== 'ready'}
              variant="ghost"
            >
              <PaperclipIcon size={20} />
            </Button>
            
            {/* Send/Stop button */}
            {status === 'submitted' ? (
              <Button
                data-testid="stop-button"
                className="size-9 rounded-full p-0 bg-blue-600 hover:bg-blue-700 hover:translate-y-[-1px] transition-all ml-1 shadow-md flex items-center justify-center"
                onClick={(event) => {
                  event.preventDefault();
                  stop();
                  setMessages((messages) => messages);
                }}
              >
                <StopIcon size={16} />
              </Button>
            ) : (
              <Button
                data-testid="send-button"
                className="size-9 rounded-full p-0 bg-blue-600 hover:bg-blue-700 hover:translate-y-[-1px] transition-all flex items-center justify-center ml-1 shadow-md"
                onClick={(event) => {
                  event.preventDefault();
                  submitForm();
                }}
                disabled={input.length === 0 || uploadQueue.length > 0}
              >
                <ArrowUpIcon size={16} />
              </Button>
            )}
          </div>
        </div>
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