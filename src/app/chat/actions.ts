// src/app/chat/actions.ts
'use server';

import { Message } from 'ai';
import { cookies } from 'next/headers';

import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from '@/libs/db/queries';
import { VisibilityType } from '@/components/visibility-selector';

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: Message;
}) {
  try {
    // Extract content safely with type assertions
    let content = '';
    
    // Handle different content formats safely
    if (typeof message.content === 'string') {
      content = message.content;
    } else {
      // For ai@3.2.18, content should be a string, but let's handle other cases
      
      // If message has parts property (from your DB schema)
      if ('parts' in message && Array.isArray(message.parts)) {
        content = message.parts.join(' ');
      } 
      // Try to safely convert message.content if it exists in any form
      else if (message.content !== undefined) {
        try {
          if (Array.isArray(message.content)) {
            // Use type assertion to treat content as any[] to bypass TypeScript error
            const contentArray = message.content as any[];
            content = contentArray
              .map(part => typeof part === 'string' ? part : (part?.text || ''))
              .join(' ');
          } else {
            content = String(message.content);
          }
        } catch (err) {
          content = String(message.content || '');
        }
      }
    }
    
    // Try to get a title from the Python backend
    try {
      const response = await fetch('http://localhost:8082/api/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: content,
          mode: 'title_generation'
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.analysis && data.analysis.title) {
          return data.analysis.title;
        }
      }
    } catch (error) {
      // Silently fallback to simple algorithm
    }

    // Fallback to a simple algorithm
    const words = content.split(/\s+/).filter(w => w.length > 2);
    let title = words.slice(0, 5).join(' ');
    
    // Truncate if too long
    if (title.length > 80) {
      title = title.substring(0, 77) + '...';
    }
    
    // If title is empty, use a default
    if (!title.trim()) {
      title = "New Chat";
    }


    return title;
  } catch (error) {
    return "New Chat";
  }
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  try {
    const message = await getMessageById({ id });

    if (message && message.length > 0 && message[0].chatId) {
      await deleteMessagesByChatIdAfterTimestamp({
        chatId: message[0].chatId,
        timestamp: message[0].createdAt,
      });
    }
  } catch (error) {
    // Silently handle error
  }
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  try {
    // Explicitly map visibility to 'private' or 'public'
    const safeVisibility: 'private' | 'public' =
      visibility === 'unlisted' || visibility === 'private'
        ? 'private'
        : 'public';

    await updateChatVisiblityById({
      chatId,
      visibility: safeVisibility
    });
  } catch (error) {
    // Silently handle error
  }
}