import { PredictionAPIClient } from '@azure/cognitiveservices-customvision-prediction';
import { ApiKeyCredentials } from '@azure/ms-rest-js';

interface PredictionResult {
  tagName: string;
  probability: number;
}

interface VisionClassificationResult {
  predictions: PredictionResult[];
  topPrediction: {
    tag: string;
    confidence: number;
  };
  isAuthentic: boolean;
  seedVariety?: string;
}

export class CustomVisionService {
  private client: PredictionAPIClient | null = null;
  private projectId: string;
  private iterationName: string;
  private endpoint: string;
  private predictionKey: string;

  constructor() {
    this.predictionKey = process.env.AZURE_CUSTOM_VISION_PREDICTION_KEY || '';
    this.endpoint = process.env.AZURE_CUSTOM_VISION_ENDPOINT || '';
    this.projectId = process.env.AZURE_CUSTOM_VISION_PROJECT_ID || '';
    this.iterationName = process.env.AZURE_CUSTOM_VISION_ITERATION_NAME || '';
  }

  private getClient(): PredictionAPIClient {
    if (!this.client) {
      if (!this.predictionKey || !this.endpoint) {
        throw new Error('Azure Custom Vision credentials not configured. Please set AZURE_CUSTOM_VISION_PREDICTION_KEY and AZURE_CUSTOM_VISION_ENDPOINT in environment variables.');
      }

      const credentials = new ApiKeyCredentials({
        inHeader: { 'Prediction-Key': this.predictionKey }
      });

      this.client = new PredictionAPIClient(credentials, this.endpoint);
    }
    return this.client;
  }

  /**
   * Classify paddy seed image using Azure Custom Vision
   */
  async classifyImage(imageBuffer: Buffer): Promise<VisionClassificationResult> {
    try {
      const client = this.getClient();
      const result = await client.classifyImage(
        this.projectId,
        this.iterationName,
        imageBuffer
      );

      if (!result.predictions || result.predictions.length === 0) {
        throw new Error('No predictions returned from Azure Custom Vision');
      }

      const predictions = result.predictions.map(pred => ({
        tagName: pred.tagName || 'unknown',
        probability: pred.probability || 0
      }));

      // Sort by confidence
      predictions.sort((a, b) => b.probability - a.probability);

      const topPrediction = predictions[0];

      // Determine authenticity based on your model's tags
      // Adjust logic based on your model's tag structure
      const isAuthentic = this.determineAuthenticity(topPrediction.tagName, topPrediction.probability);

      return {
        predictions,
        topPrediction: {
          tag: topPrediction.tagName,
          confidence: topPrediction.probability * 100
        },
        isAuthentic,
        seedVariety: this.extractSeedVariety(topPrediction.tagName)
      };
    } catch (error) {
      console.error('Azure Custom Vision API Error:', error);
      throw new Error('Failed to classify image with Azure Custom Vision');
    }
  }

  /**
   * Classify using image URL
   */
  async classifyImageUrl(imageUrl: string): Promise<VisionClassificationResult> {
    try {
      const client = this.getClient();
      const result = await client.classifyImageUrl(
        this.projectId,
        this.iterationName,
        { url: imageUrl }
      );

      if (!result.predictions || result.predictions.length === 0) {
        throw new Error('No predictions returned from Azure Custom Vision');
      }

      const predictions = result.predictions.map(pred => ({
        tagName: pred.tagName || 'unknown',
        probability: pred.probability || 0
      }));

      predictions.sort((a, b) => b.probability - a.probability);
      const topPrediction = predictions[0];

      const isAuthentic = this.determineAuthenticity(topPrediction.tagName, topPrediction.probability);

      return {
        predictions,
        topPrediction: {
          tag: topPrediction.tagName,
          confidence: topPrediction.probability * 100
        },
        isAuthentic,
        seedVariety: this.extractSeedVariety(topPrediction.tagName)
      };
    } catch (error) {
      console.error('Azure Custom Vision URL API Error:', error);
      throw new Error('Failed to classify image URL with Azure Custom Vision');
    }
  }

  /**
   * Determine if seed is authentic based on tag and confidence
   * Adjusted for Pure/Negative classification model
   */
  private determineAuthenticity(tag: string, probability: number): boolean {
    const tagLower = tag.toLowerCase();

    // Custom Vision model returns "Pure" (good quality) or "Negative" (bad quality)
    if (tagLower === 'pure') {
      return probability >= 0.6; // 60% confidence threshold for pure seeds
    }
    
    if (tagLower === 'negative') {
      return false; // Negative classification means not authentic
    }

    // Fallback for other tag types
    const authenticTags = ['genuine', 'authentic', 'certified', 'original'];
    const fakeTags = ['fake', 'counterfeit', 'suspicious', 'duplicate'];

    if (fakeTags.some(fakeTag => tagLower.includes(fakeTag))) {
      return false;
    }

    if (authenticTags.some(authTag => tagLower.includes(authTag))) {
      return probability >= 0.7; // 70% confidence threshold
    }

    // Default: require high confidence for unknown tags
    return probability >= 0.75;
  }

  /**
   * Extract seed variety name from tag
   */
  private extractSeedVariety(tag: string): string | undefined {
    // Example: "BPT-5204-Genuine" -> "BPT-5204"
    // Adjust parsing based on your tag naming convention
    const varietyMatch = tag.match(/^([A-Z0-9\-]+)/);
    return varietyMatch ? varietyMatch[1] : tag;
  }

  /**
   * Batch classification for multiple images
   */
  async classifyBatch(imageBuffers: Buffer[]): Promise<VisionClassificationResult[]> {
    const results = await Promise.all(
      imageBuffers.map(buffer => this.classifyImage(buffer))
    );
    return results;
  }
}

// Singleton instance
export const customVisionService = new CustomVisionService();
