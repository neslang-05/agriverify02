
import { OpenAI, AzureOpenAI } from 'openai';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testConnection() {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';

  if (!apiKey || !endpoint || !deploymentName) {
    console.error('Missing environment variables. Please check .env.local');
    return;
  }

  console.log('Testing with AzureOpenAI class and full error logging...');
  const client = new AzureOpenAI({
    endpoint,
    apiKey,
    deployment: deploymentName,
    apiVersion,
    timeout: 10000, // 10 seconds
  });

  try {
    const response = await client.chat.completions.create({
      messages: [{ role: 'user', content: 'Hello' }],
      max_completion_tokens: 10
    } as any);
    console.log('Success:', response.choices[0].message.content);
  } catch (error: any) {
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    if (error.cause) {
      console.error('Error Cause:', error.cause);
    }
  }
}

testConnection();
