// Quick test script to validate Azure OpenAI credentials
// Usage: node scripts/test-azure-openai.js

import dotenv from 'dotenv';
import { AzureOpenAI } from 'openai';

dotenv.config();

async function main() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-10-21';

  if (!endpoint || !apiKey) {
    console.error('Missing AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_API_KEY in environment');
    process.exit(2);
  }

  try {
    const client = new AzureOpenAI({
      endpoint,
      apiKey,
      deployment,
      apiVersion,
    });

    console.log('Testing Azure OpenAI credentials...');

    const resp = await client.chat.completions.create({
      model: deployment,
      messages: [
        { role: 'system', content: 'You are a test assistant.' },
        { role: 'user', content: 'Say hello' }
      ],
      max_completion_tokens: 50,
    });

    console.log('Success: received response:');
    console.log(JSON.stringify(resp.choices?.[0]?.message, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error from Azure OpenAI:');
    console.error(err);
    process.exit(1);
  }
}

main();
