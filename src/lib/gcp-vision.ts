/**
 * Google Cloud Run ResNet Model Integration
 * 
 * This module provides integration with a custom-trained ResNet model hosted on Google Cloud Run
 * for paddy seed quality classification. The API endpoint performs predictions on seed images
 * with output indicating seed quality (pure/impure).
 * 
 * API Endpoint: https://resnet-api-297419987783.asia-south1.run.app/predict
 * Method: POST (multipart/form-data)
 * Response: { filename, prediction, confidence }
 */

interface GCPPredictionResponse {
  filename: string;
  prediction: string; // e.g., "pure" or "impure"
  confidence: number; // 0-1 range
}

interface PredictionResult {
  tagName: string;
  probability: number;
}

interface VisionClassificationResult {
  predictions: PredictionResult[];
  topPrediction: {
    tag: string;
    confidence: number; // 0-100 range for consistency with existing code
  };
  isAuthentic: boolean;
  seedVariety?: string;
}

export class GCPVisionService {
  private endpoint: string;

  constructor() {
    this.endpoint = process.env.GCP_VISION_ENDPOINT || 
                   'https://resnet-api-297419987783.asia-south1.run.app/predict';
  }

  /**
   * Classify paddy seed image using GCP Custom Model
   * @param imageBuffer - Image file as Buffer
   * @returns VisionClassificationResult with predictions and authenticity determination
   */
  async classifyImage(imageBuffer: Buffer, filename?: string): Promise<VisionClassificationResult> {
    try {
      // Create FormData with the image
      const formData = new FormData();
      const uint8Array = new Uint8Array(imageBuffer);
      const blob = new Blob([uint8Array], { type: 'image/jpeg' });
      formData.append('file', blob, filename || 'seed-image.jpg');

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        // Send request to GCP endpoint
        const response = await fetch(this.endpoint, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`GCP API returned status ${response.status}: ${response.statusText}`);
        }

        const result: GCPPredictionResponse = await response.json();

        // Validate response structure
        if (!result.prediction || result.confidence === undefined) {
          throw new Error('Invalid response format from GCP API');
        }

        // Normalize prediction to consistent format
        const isAuthentic = this.determineAuthenticity(result.prediction, result.confidence);
        const confidencePercent = result.confidence * 100; // Convert 0-1 to 0-100

        return {
          predictions: [
            {
              tagName: result.prediction,
              probability: result.confidence
            }
          ],
          topPrediction: {
            tag: result.prediction,
            confidence: confidencePercent
          },
          isAuthentic,
          seedVariety: this.extractSeedVariety(result.prediction)
        };
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('GCP Vision API request timeout (30 seconds)');
      }
      console.error('GCP Vision API Error:', error);
      throw new Error(`Failed to classify image with GCP Vision: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Classify using image URL (for future use if GCP endpoint supports it)
   * Falls back to classifyImage if not implemented
   */
  async classifyImageUrl(imageUrl: string): Promise<VisionClassificationResult> {
    try {
      // For now, download the image and use classifyImage
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);
      return this.classifyImage(imageBuffer, imageUrl.split('/').pop());
    } catch (error) {
      console.error('GCP Vision URL API Error:', error);
      throw new Error(`Failed to classify image URL with GCP Vision: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Determine if seed is authentic based on prediction and confidence
   * 
   * Prediction values:
   * - "pure": High-quality, authentic seeds
   * - "impure": Low-quality, potentially counterfeit seeds
   */
  private determineAuthenticity(prediction: string, confidence: number): boolean {
    const predictionLower = prediction.toLowerCase();

    // "pure" classification indicates authentic seeds
    if (predictionLower === 'pure') {
      return confidence >= 0.6; // 60% confidence threshold for pure seeds
    }

    // "impure" classification indicates non-authentic seeds
    if (predictionLower === 'impure') {
      return false;
    }

    // Fallback for other prediction types
    const authenticTags = ['genuine', 'authentic', 'certified', 'original', 'pure'];
    const fakeTags = ['fake', 'counterfeit', 'suspicious', 'duplicate', 'impure'];

    if (fakeTags.some(fakeTag => predictionLower.includes(fakeTag))) {
      return false;
    }

    if (authenticTags.some(authTag => predictionLower.includes(authTag))) {
      return confidence >= 0.7;
    }

    // Default: require high confidence for unknown predictions
    return confidence >= 0.75;
  }

  /**
   * Extract seed variety name from prediction tag (if applicable)
   */
  private extractSeedVariety(prediction: string): string | undefined {
    // For now, return undefined as the GCP model returns simple labels
    // Can be extended if the model provides variety information
    return undefined;
  }

  /**
   * Batch classification for multiple images
   */
  async classifyBatch(imageBuffers: Buffer[]): Promise<VisionClassificationResult[]> {
    const results = await Promise.all(
      imageBuffers.map((buffer, index) => 
        this.classifyImage(buffer, `image-${index}.jpg`)
      )
    );
    return results;
  }
}

// Singleton instance
export const gcpVisionService = new GCPVisionService();
