'use client';
import type { Attachment, UIMessage } from 'ai';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { WICFINLogo } from './icons';
import { ChatHeader } from '@/components/chat-header';
import { Messages } from './messages';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { useArtifactSelector } from '@/hooks/use-artifact';
import type { VisibilityType } from './visibility-selector';
import { SuggestedActions } from './suggested-actions';
import { Greeting } from './greeting';




interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'data'; 
  content: string;
  createdAt?: Date;
  wicchain_id?: string;
  parts?: Array<{ type: string; text: string; [key: string]: any }>; 
}

function toUIMessage(message: {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
  wicchain_id?: string;
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

interface UploadedDocument {
  name: string;
  type: string;
  size: number;
  wicchain_id: string; 
}

interface SimplifiedChatProps {
  id: string;
  initialMessages: Array<UIMessage>;
  selectedChatModel?: string;
  selectedVisibilityType?: VisibilityType;
  isReadonly?: boolean;
}

export function SimplifiedChat({
  id,
  initialMessages = [],
  selectedChatModel = 'default',
  selectedVisibilityType = 'private',
  isReadonly = false,
}: SimplifiedChatProps) {
  const [messages, setMessages] = useState<Message[]>([]); 
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);
  const rawStatus = isLoading ? 'in_progress' : 'awaiting_message';
  const status = getCompatibleStatus(rawStatus);

  
  useEffect(() => {
    console.log("Current initialMessages:", initialMessages);
    if (initialMessages && initialMessages.length > 0) {
      
      const convertedMessages = initialMessages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
        parts: msg.parts
      }));
      console.log("Setting messages from initialMessages:", convertedMessages);
      setMessages(initialMessages as unknown as Message[]);
    }
  }, [initialMessages]);

  useEffect(() => {
    console.log("Messages updated:", messages);
  }, [messages]);

  const stop = () => {
    setIsLoading(false);
    console.log('Generation stopped'); // Add debugging information
  };

  const reload = async (): Promise<string | null> => {
    try {
      console.log('Reloading messages...');
      // Add logic to reload messages if needed
      return null;
    } catch (error) {
      console.error('Error reloading messages:', error);
      return null;
    }
  };

  const append = async (message: UIMessage | any) => {
    try {
      if (message.parts) {
        // If it's already a UIMessage, just add it
        setMessages((prev) => [...prev, message as Message]);
      } else {
        // Otherwise convert it
        const convertedMessage = toUIMessage(message);
        setMessages((prev) => [...prev, convertedMessage as unknown as Message]);

        // Process the message if it's from the user
        if (message.role === 'user') {
          await handleUserMessage(convertedMessage.content);
        }
      }
    } catch (error) {
      console.error('Error appending message:', error);
      toast.error('Failed to append message');
    }
    return null;
  };

  const handleUserMessage = async (content: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ message: content, chatId: id }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (data.success && data.response) {
        const assistantContent = data.response.message || '';
        const wicchain_id = data.response.wicchain_id || '';
  
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: assistantContent,
          wicchain_id: wicchain_id,
          createdAt: new Date(),
          parts: [{ type: 'text', text: assistantContent }]
        };
        console.log("Adding assistant message from handleUserMessage:", assistantMessage);
        setMessages((prev) => [...prev, assistantMessage as unknown as Message]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

 

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', 'general');

      console.log('Uploading to:', '/chat/api/document');
      const response = await fetch('/chat/api/document', {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        try {
        const errorData = await response.json();
        console.error('Error data:', errorData);
        throw new Error(errorData.error || `Server error (${response.status})`);
      } catch (parseError) {
        throw new Error(`Server error (${response.status})`);
      }
    }
      
      const data = await response.json();
      console.log('Upload response data:', data);

      if (data.success) {
        setUploadedDocuments((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            wicchain_id: data.response.wicchain_id,
          },
        ]);

        toast.success('Document uploaded successfully!');

        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: `I've received your document "${file.name}" and processed it securely using WICchain technology. The document has been verified and stored securely. What would you like to do next?`,
          wicchain_id: data.response.wicchain_id,
          createdAt: new Date(),
          parts: [{ type: 'text', text: `I've received your document "${file.name}" and processed it securely using WICchain technology. The document has been verified and stored securely. What would you like to do next?` }] 

        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        toast.error('Document upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      
      let errorMessage = 'Problem uploading your document. Please try again.';
      if (error instanceof Error) {
        // Make displayed error more user-friendly
        if (error.message.includes('404')) {
          errorMessage = 'Upload service not found. Please try again in a moment.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Check your internet connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const renderMessageContent = (content: string) => {
    const normalizedContent = content
      .replace(/\r\n/g, '\n') 
      .replace(/\n{3,}/g, '\n\n') 
      .trim();

    console.log('Rendering message:', JSON.stringify(normalizedContent));

    const blocks = normalizedContent.split(/\n\n/);

    return blocks.map((block, blockIndex) => {
      const bulletListMatch = block.match(/^([•\-*]\s+.+)(\n[•\-*]\s+.+)*$/);
      if (bulletListMatch) {
        const listItems = block.split(/\n[•\-*]\s+/);
        const firstItem = listItems[0].replace(/^[•\-*]\s+/, '');
        const remainingItems = listItems.slice(1);
        
        return (
          <div key={`bullet-list-${blockIndex}`} className="mb-4">
            <ul className="list-disc pl-5 space-y-1">
              <li>{firstItem}</li>
              {remainingItems.map((item, i) => (
                <li key={`bullet-item-${i}`}>{item}</li>
              ))}
            </ul>
          </div>
        );
      }

      const numberedListMatch = block.match(/^(\d+\.\s+.+)(\n\d+\.\s+.+)*$/);
      if (numberedListMatch) {
        const listItems = block.split(/\n\d+\.\s+/);
        const firstItem = listItems[0].replace(/^\d+\.\s+/, '');
        const remainingItems = listItems.slice(1);
        
        return (
          <div key={`numbered-list-${blockIndex}`} className="mb-4">
            <ol className="list-decimal pl-5 space-y-1">
              <li>{firstItem}</li>
              {remainingItems.map((item, i) => (
                <li key={`numbered-item-${i}`}>{item}</li>
              ))}
            </ol>
          </div>
        );
      }

      const featureSectionMatch = block.match(/^([A-Za-z\s]+):(.+)$/s);
      if (featureSectionMatch) {
        const [_, header, content] = featureSectionMatch;
        const contentItems = content.trim().split('\n');
        
        return (
          <div key={`feature-section-${blockIndex}`} className="mb-4">
            <p className="font-medium">{header}:</p>
            <div className="pl-2 mt-1">
              {contentItems.map((item, i) => {
                if (item.trim().match(/^[•\-*]\s+/)) {
                  return (
                    <div key={`feature-item-${i}`} className="flex items-start mb-1">
                      <span className="mr-2">•</span>
                      <span>{item.trim().replace(/^[•\-*]\s+/, '')}</span>
                    </div>
                  );
                }
                return <p key={`feature-item-${i}`} className="mb-1">{item.trim()}</p>;
              })}
            </div>
          </div>
        );
      }

      return (
        <p key={`paragraph-${blockIndex}`} className="mb-4 last:mb-0 break-words whitespace-normal">
          {block}
        </p>
      );
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input,
      createdAt: new Date(),
      parts: [{ type: 'text', text: input }]
    };

    console.log("Adding user message:", userMessage);

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ message: input, chatId: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.response) {
        const assistantContent = data.response.message || '';
        const wicchain_id = data.response.wicchain_id || '';

        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: assistantContent,
          wicchain_id: wicchain_id,
          createdAt: new Date(),
          parts: [{ type: 'text', text: assistantContent }]
        };

        console.log("Adding assistant message:", assistantMessage);
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('Error:', error);
        toast.error('Failed to process request');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const appendMessage = (content: string): Promise<string> => {
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const controller = new AbortController();

    return fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({ message: content, chatId: id }),
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.success && data.response) {
          const assistantContent = data.response.message || '';
          const wicchain_id = data.response.wicchain_id || '';
          const isDuplicate = messages.some(
            (message) =>
              message.role === 'assistant' &&
              message.content === assistantContent &&
              message.wicchain_id === wicchain_id
          );

          if (!isDuplicate) {
            const assistantMessage: Message = {
              id: generateId(),
              role: 'assistant',
              content: assistantContent,
              wicchain_id: wicchain_id,
              createdAt: new Date(),
              parts: [{ type: 'text', text: assistantContent }]
            };
            setMessages((prev) => [...prev, assistantMessage]);
          } else {
            console.log('Duplicate message detected, not adding to chat');
          }
        }
        return content;
      })
      .catch((error) => {
        console.error('Error:', error);
        toast.error('Failed to process request');
        return content;
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const abortController = new AbortController();

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <>
      <div className="flex flex-col min-w-0 h-full bg-background relative">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />
    
        <Messages
          chatId={id}
          status={status}
          votes={[]}
          messages={messages as any}
          setMessages={setMessages as any}
          reload={reload as any}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
        />

        

    
        <form 
          className="sticky bottom-0 z-10 bg-background/90 backdrop-blur-md flex flex-col mx-auto p-4 gap-2 w-full md:max-w-3xl" 
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
              messages={messages as any}
              setMessages={setMessages as any}
              append={append as any}
            />
          )}
        </form>
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
        messages={messages as any}
        setMessages={setMessages as any}
        reload={reload as any}
        votes={[]}
        isReadonly={isReadonly}
      />
    </>
  );
}