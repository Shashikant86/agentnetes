import { createGoogleGenerativeAI } from '@ai-sdk/google';

/**
 * Returns a Google Gemini model directly, stripping any 'google/' prefix.
 * Accepts an optional API key override (from UI settings).
 */
export function gateway(model: string, apiKeyOverride?: string) {
  const google = createGoogleGenerativeAI({
    apiKey: apiKeyOverride ?? process.env.GOOGLE_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });
  const modelId = model.includes('/') ? model.split('/').slice(1).join('/') : model;
  return google(modelId);
}
