import { getChatResponse } from '../src/app/actions/verification';

describe('Chat Response Tests', () => {
  test('should return greeting response for hello', async () => {
    const response = await getChatResponse('hello', 'test-user');
    expect(response).toContain('agricultural assistant');
  });

  test('should return fallback response when OpenAI is disabled', async () => {
    // Since ENABLE_AZURE_OPENAI_CHAT is not set to 'true', it should use fallback
    const response = await getChatResponse('tell me about rice farming', 'test-user');
    expect(response).toBeTruthy();
    expect(typeof response).toBe('string');
  });

  test('should handle empty message', async () => {
    const response = await getChatResponse('', 'test-user');
    expect(response).toBeTruthy();
  });
});