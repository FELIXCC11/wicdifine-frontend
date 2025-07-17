import { z } from 'zod';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

import type { Suggestion } from '@/libs/db/schema';
import { generateUUID } from '@/libs/utils';
// Fixed: Remove .ts extension from import path
import { myProvider } from '../providers';

const suggestionsSchema = z.object({
  suggestions: z.array(
    z.object({
      originalText: z.string().describe('The original text to be replaced'),
      suggestedText: z.string().describe('The suggested replacement text'),
    })
  ),
});

export interface RequestSuggestionsProps {
  session: any; // You may want to type this properly based on your session type
}

export async function requestSuggestions({
  session,
}: RequestSuggestionsProps): Promise<Array<Suggestion>> {
  'use server';

  try {
    // For now, return mock suggestions to avoid AI streaming issues
    // You can enable this later when AI integration is stable
    
    const mockSuggestions: Array<Suggestion> = [
      {
        id: generateUUID(),
        originalText: 'loan application',
        suggestedText: 'loan request',
        createdAt: new Date(),
        userId: session?.user?.id || 'anonymous',
        documentId: 'current-document',
        description: null,
        documentCreatedAt: null,
        isResolved: null,
      },
      {
        id: generateUUID(),
        originalText: 'interest rate',
        suggestedText: 'annual percentage rate (APR)',
        createdAt: new Date(),
        userId: session?.user?.id || 'anonymous',
        documentId: 'current-document',
        description: null,
        documentCreatedAt: null,
        isResolved: null,
      }
    ];

    return mockSuggestions;

    // Original AI-based implementation (commented out for now):
    /*
    const result = await generateObject({
      model: myProvider,
      schema: suggestionsSchema,
      prompt: `Generate helpful text suggestions for a loan application document.
               Focus on improving clarity, professionalism, and completeness.
               Suggest improvements for common phrases and terms.`,
    });

    return result.object.suggestions.map((suggestion) => ({
      id: generateUUID(),
      originalText: suggestion.originalText,
      suggestedText: suggestion.suggestedText,
      createdAt: new Date(),
      userId: session?.user?.id || 'anonymous',
      documentId: 'current-document',
      description: null,
      documentCreatedAt: null,
      isResolved: null,
    }));
    */

  } catch (error) {
    console.error('Error generating suggestions:', error);
    
    // Return empty array on error
    return [];
  }
}