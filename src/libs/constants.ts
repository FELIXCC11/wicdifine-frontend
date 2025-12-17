// src/libs/constants.ts
// Environment detection
export const isTestEnvironment = 
  process.env.NODE_ENV === 'test' || 
  process.env.NEXT_PUBLIC_USE_TEST_MODELS === 'true';

// API endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Chat constants
export const MAX_MESSAGES_PER_CHAT = 100;

export const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || 'http://localhost:8082';
export const isProductionEnvironment = process.env.NODE_ENV === 'production';


// Artifact constants
export const SUPPORTED_ARTIFACT_TYPES = ['text', 'code', 'image', 'sheet'];