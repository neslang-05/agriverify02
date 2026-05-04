import { gcpVisionService } from '../gcp-vision';

export async function classifyWithFallback(
  imageBuffer: Buffer,
  imageUrl: string
) {
  try {
    // Primary: Google Cloud Run Custom Model
    return await gcpVisionService.classifyImage(imageBuffer);
  } catch (error) {
    console.error('GCP Vision failed, attempting fallback:', error);
    
    try {
      // Fallback 1: Try URL method if available
      return await gcpVisionService.classifyImageUrl(imageUrl);
    } catch (urlError) {
      console.error('URL method failed:', urlError);
      
      // Fallback 2: Rule-based classification
      return {
        predictions: [],
        topPrediction: {
          tag: 'unknown',
          confidence: 0
        },
        isAuthentic: false,
        error: 'GCP Vision service unavailable'
      };
    }
  }
}
