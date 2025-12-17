// src/libs/ai/models.test.ts (updated)
import { Provider } from 'ai';

// Mocked models for testing
export const chatModel = {
  id: 'chat-model-mock',
  provider: 'test' as unknown as Provider,
  streamable: true,
  displayName: 'Test Chat Model'
};

export const reasoningModel = {
  id: 'reasoning-model-mock',
  provider: 'test' as unknown as Provider,
  streamable: true,
  displayName: 'Test Reasoning Model'
};

export const titleModel = {
  id: 'title-model-mock',
  provider: 'test' as unknown as Provider,
  streamable: true,
  displayName: 'Test Title Model'
};

export const artifactModel = {
  id: 'artifact-model-mock',
  provider: 'test' as unknown as Provider,
  streamable: true,
  displayName: 'Test Artifact Model'
};