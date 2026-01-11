import { customVisionService } from './custom-vision';

export async function classifyWithFallback(
  imageBuffer: Buffer,
  imageUrl: string
) {
  try {
    // Primary: Azure Custom Vision
    return await customVisionService.classifyImage(imageBuffer);
  } catch (error) {
    console.error('Azure Vision failed, attempting fallback:', error);
    
    try {
      // Fallback 1: Try URL method
      return await customVisionService.classifyImageUrl(imageUrl);
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
        error: 'Azure Custom Vision service unavailable'
      };
    }
  }
}
