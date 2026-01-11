import { AzureOpenAI } from 'openai';

let openaiClient: AzureOpenAI | null = null;

export function getOpenAIClient(): AzureOpenAI {
  if (!openaiClient) {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';

    if (!endpoint || !apiKey) {
      throw new Error('Azure OpenAI environment variables not configured');
    }

    openaiClient = new AzureOpenAI({
      endpoint,
      apiKey,
      deployment,
      apiVersion: '2024-02-15-preview',
    });
  }

  return openaiClient;
}