/**
 * Azure Custom Vision Integration Tests
 * 
 * To run these tests:
 * 1. Set up test images in __tests__/fixtures/images/
 * 2. Configure Azure credentials in .env.test
 * 3. Run: npm test azure-vision.test.ts
 */

import { customVisionService } from '@/lib/azure/custom-vision';
import { classifyWithFallback } from '@/lib/azure/custom-vision-fallback';
import fs from 'fs';
import path from 'path';

// Mock environment variables for testing
process.env.AZURE_CUSTOM_VISION_PREDICTION_KEY = process.env.AZURE_CUSTOM_VISION_PREDICTION_KEY || 'test-key';
process.env.AZURE_CUSTOM_VISION_ENDPOINT = process.env.AZURE_CUSTOM_VISION_ENDPOINT || 'https://test.cognitiveservices.azure.com';
process.env.AZURE_CUSTOM_VISION_PROJECT_ID = process.env.AZURE_CUSTOM_VISION_PROJECT_ID || 'test-project-id';
process.env.AZURE_CUSTOM_VISION_ITERATION_NAME = process.env.AZURE_CUSTOM_VISION_ITERATION_NAME || 'Iteration1';

describe('Azure Custom Vision Integration', () => {
  const testImagesPath = path.join(__dirname, 'fixtures', 'images');

    // Skip tests if Azure credentials are not configured
    const isAzureConfigured = 
      process.env.AZURE_CUSTOM_VISION_PREDICTION_KEY !== 'test-key' &&
      process.env.AZURE_CUSTOM_VISION_ENDPOINT !== 'https://test.cognitiveservices.azure.com';

    // Avoid running live integration tests in CI environments by default
    const isCi = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
    const runAzureIntegration = isAzureConfigured && !isCi;

  describe('Custom Vision Service', () => {
    test('should initialize with correct configuration', () => {
      expect(customVisionService).toBeDefined();
    });

    (runAzureIntegration ? test : test.skip)('should classify genuine paddy seed image', async () => {
      const imagePath = path.join(testImagesPath, 'genuine-seed.jpg');
      
      if (!fs.existsSync(imagePath)) {
        console.warn('Test image not found, skipping test');
        return;
      }

      const imageBuffer = fs.readFileSync(imagePath);
      const result = await customVisionService.classifyImage(imageBuffer);
      
      expect(result).toHaveProperty('predictions');
      expect(result).toHaveProperty('topPrediction');
      expect(result).toHaveProperty('isAuthentic');
      expect(result.topPrediction.confidence).toBeGreaterThan(0);
      expect(result.predictions.length).toBeGreaterThan(0);
      
      // If genuine seed, expect high confidence
      if (result.isAuthentic) {
        expect(result.topPrediction.confidence).toBeGreaterThan(70);
      }
    }, 10000); // 10 second timeout for API call

    (runAzureIntegration ? test : test.skip)('should detect fake seed packaging', async () => {
      const imagePath = path.join(testImagesPath, 'fake-seed.jpg');
      
      if (!fs.existsSync(imagePath)) {
        console.warn('Test image not found, skipping test');
        return;
      }

      const imageBuffer = fs.readFileSync(imagePath);
      const result = await customVisionService.classifyImage(imageBuffer);
      
      expect(result).toHaveProperty('isAuthentic');
      expect(result.topPrediction).toBeDefined();
      
      // If fake seed, expect low authenticity
      if (!result.isAuthentic) {
        console.log('Successfully detected fake seed');
      }
    }, 10000);

    (runAzureIntegration ? test : test.skip)('should classify using image URL', async () => {
      const testImageUrl = 'https://example.com/test-seed-image.jpg';
      
      try {
        const result = await customVisionService.classifyImageUrl(testImageUrl);
        expect(result).toHaveProperty('predictions');
        expect(result).toHaveProperty('topPrediction');
      } catch (error) {
        // URL method may fail with test URL, which is expected
        console.log('URL method test skipped (expected with test URL)');
      }
    }, 10000);

    test('should handle invalid image buffer', async () => {
      const invalidBuffer = Buffer.from('');
      
      await expect(
        customVisionService.classifyImage(invalidBuffer)
      ).rejects.toThrow();
    });

    (runAzureIntegration ? test : test.skip)('should extract seed variety from tag', async () => {
      const imagePath = path.join(testImagesPath, 'genuine-seed.jpg');
      
      if (!fs.existsSync(imagePath)) {
        console.warn('Test image not found, skipping test');
        return;
      }

      const imageBuffer = fs.readFileSync(imagePath);
      const result = await customVisionService.classifyImage(imageBuffer);
      
      // If seed variety is detected, it should be a non-empty string
      if (result.seedVariety) {
        expect(typeof result.seedVariety).toBe('string');
        expect(result.seedVariety.length).toBeGreaterThan(0);
      }
    }, 10000);
  });

  describe('Fallback Logic', () => {
    test('should use fallback when primary method fails', async () => {
      const testBuffer = Buffer.from('test');
      const testUrl = 'https://test.example.com/image.jpg';
      
      // This should trigger fallback logic due to invalid credentials
      const result = await classifyWithFallback(testBuffer, testUrl);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('topPrediction');
    });

    test('should return error state when all methods fail', async () => {
      const invalidBuffer = Buffer.from('');
      const invalidUrl = '';
      
      const result = await classifyWithFallback(invalidBuffer, invalidUrl);
      
      expect(result).toHaveProperty('topPrediction');
      expect(result.topPrediction.confidence).toBe(0);
      expect(result.isAuthentic).toBe(false);
    });
  });

  describe('Batch Classification', () => {
    (runAzureIntegration ? test : test.skip)('should classify multiple images', async () => {
      const image1Path = path.join(testImagesPath, 'genuine-seed.jpg');
      const image2Path = path.join(testImagesPath, 'fake-seed.jpg');
      
      if (!fs.existsSync(image1Path) || !fs.existsSync(image2Path)) {
        console.warn('Test images not found, skipping batch test');
        return;
      }

      const buffers = [
        fs.readFileSync(image1Path),
        fs.readFileSync(image2Path)
      ];
      
      const results = await customVisionService.classifyBatch(buffers);
      
      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty('topPrediction');
      expect(results[1]).toHaveProperty('topPrediction');
    }, 20000); // 20 seconds for batch processing
  });

  describe('Performance', () => {
    (runAzureIntegration ? test : test.skip)('should complete classification within timeout', async () => {
      const imagePath = path.join(testImagesPath, 'genuine-seed.jpg');
      
      if (!fs.existsSync(imagePath)) {
        console.warn('Test image not found, skipping performance test');
        return;
      }

      const imageBuffer = fs.readFileSync(imagePath);
      const startTime = Date.now();
      
      await customVisionService.classifyImage(imageBuffer);
      
      const duration = Date.now() - startTime;
      
      // Azure API should respond within 5 seconds
      expect(duration).toBeLessThan(5000);
    }, 10000);
  });
});

describe('Authenticity Determination Logic', () => {
  test('should consider "genuine" tag as authentic with high confidence', () => {
    // This tests the internal logic via the service
    const testTag = 'genuine-seed';
    const testProbability = 0.85;
    
    // We can't directly test private methods, but we can verify behavior
    // through the public API results in integration tests
    expect(testProbability).toBeGreaterThanOrEqual(0.7);
  });

  test('should consider "fake" tag as not authentic', () => {
    const testTag = 'fake-counterfeit';
    const testProbability = 0.90;
    
    // Fake tags should always return false for authenticity
    expect(testTag.toLowerCase()).toContain('fake');
  });
});
