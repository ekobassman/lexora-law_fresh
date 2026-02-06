import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY ?? '';

export const openai = apiKey
  ? new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // Use Edge Functions in production instead
    })
  : null;

export const OPENAI_MODEL = 'gpt-4o-mini';
export const OPENAI_TEMPERATURE_CHAT = 0.7;
export const OPENAI_TEMPERATURE_DOCUMENT = 0.4;
export const OPENAI_MAX_TOKENS = 4096;
