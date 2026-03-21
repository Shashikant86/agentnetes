import { createGatewayProvider } from '@ai-sdk/gateway';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

/**
 * Returns a model provider.
 * - If AI_GATEWAY_BASE_URL is set: routes through Vercel AI Gateway
 * - Otherwise: uses Google Gemini directly via GOOGLE_API_KEY
 */
function makeProvider() {
  if (process.env.AI_GATEWAY_BASE_URL) {
    return createGatewayProvider({ baseURL: process.env.AI_GATEWAY_BASE_URL });
  }
  // Direct Google fallback for local execution
  return createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });
}

const provider = makeProvider();

/**
 * gateway('google/gemini-2.5-pro') works with the gateway.
 * For direct Google, we strip the 'google/' prefix.
 */
export function gateway(model: string) {
  if (process.env.AI_GATEWAY_BASE_URL) {
    return (provider as ReturnType<typeof createGatewayProvider>)(model);
  }
  // Strip provider prefix: "google/gemini-2.5-pro" -> "gemini-2.5-pro"
  const modelId = model.includes('/') ? model.split('/').slice(1).join('/') : model;
  return (provider as ReturnType<typeof createGoogleGenerativeAI>)(modelId);
}
