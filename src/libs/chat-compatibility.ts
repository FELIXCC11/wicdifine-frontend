import type { UIMessage } from 'ai';

// Convert simplified message to UIMessage format
export function toUIMessage(message: {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}): UIMessage {
  // Create a compatible message with required parts array
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt,
    // Add the required parts property
    parts: [{
      type: 'text',
      text: message.content
    }]
  } as UIMessage;
}

// Convert chat status format
export function getCompatibleStatus(status: 'in_progress' | 'awaiting_message'): 'streaming' | 'submitted' | 'ready' | 'error' {
  if (status === 'in_progress') return 'streaming';
  return 'ready';
}