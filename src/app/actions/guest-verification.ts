'use server';

import { customVisionService } from '@/lib/azure/custom-vision';

interface Prediction {
  tagName: string;
  probability: number;
}

interface ClassificationResult {
  predictions: Prediction[];
  topPrediction: {
    tag: string;
    confidence: number;
  };
  isAuthentic: boolean;
  seedVariety?: string;
}

interface GuestVerificationResult {
  status: 'good' | 'bad';
  emoji: string;
  message: string;
  rawData: ClassificationResult[];
  avgGood: number;
  avgBad: number;
  isFlagged: boolean;
}

/**
 * Process multiple images for guest (anonymous) verification
 * Aggregates results from Azure Custom Vision and provides a simplified result
 */
export async function processGuestImages(base64Images: string[]): Promise<GuestVerificationResult> {
  try {
    // Convert base64 images to buffers and classify in parallel
    const results = await Promise.all(
      base64Images.map(async (base64) => {
        // Remove data URL prefix if present
        const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        try {
          return await customVisionService.classifyImage(buffer);
        } catch (error) {
          console.error('Error classifying image:', error);
          // Return a fallback result for failed classifications
          return {
            predictions: [
              { tagName: 'unknown', probability: 0 }
            ],
            topPrediction: {
              tag: 'unknown',
              confidence: 0
            },
            isAuthentic: false,
            seedVariety: undefined
          };
        }
      })
    );

    // Aggregation Logic
    let badScoreSum = 0;
    let goodScoreSum = 0;
    let isFlagged = false;

    results.forEach((res) => {
      const negative = res.predictions.find(p => 
        p.tagName.toLowerCase() === 'negative' || 
        p.tagName.toLowerCase() === 'fake' ||
        p.tagName.toLowerCase() === 'counterfeit'
      )?.probability || 0;
      
      const pure = res.predictions.find(p => 
        p.tagName.toLowerCase() === 'pure' || 
        p.tagName.toLowerCase() === 'genuine' ||
        p.tagName.toLowerCase() === 'authentic'
      )?.probability || 0;

      // Safety Valve: If ANY single image is > 80% negative, flag the whole batch
      if (negative > 0.8) {
        isFlagged = true;
      }

      badScoreSum += negative;
      goodScoreSum += pure;
    });

    const avgBad = results.length > 0 ? badScoreSum / results.length : 0;
    const avgGood = results.length > 0 ? goodScoreSum / results.length : 0;

    // Final Determination
    let status: 'good' | 'bad';
    let emoji: string;
    let message: string;

    if (isFlagged || avgBad > avgGood) {
      status = 'bad';
      emoji = '😟';
      message = "These seeds show signs of impurity or damage. We recommend reporting this batch to ensure quality standards are maintained.";
    } else {
      status = 'good';
      emoji = '😊';
      message = "Great news! These seeds look pure and healthy based on our visual analysis. The texture appears consistent and no foreign matter was detected.";
    }

    return { 
      status, 
      emoji, 
      message, 
      rawData: results,
      avgGood,
      avgBad,
      isFlagged
    };

  } catch (error) {
    console.error('Guest verification error:', error);
    
    // Return a fallback result if Azure Custom Vision is unavailable
    return {
      status: 'bad',
      emoji: '⚠️',
      message: "We couldn't analyze the images at this time. Please try again later or contact support if the issue persists.",
      rawData: [],
      avgGood: 0,
      avgBad: 0,
      isFlagged: false
    };
  }
}

/**
 * Store guest scan data temporarily (for persistence across auth flow)
 * In production, this could use Redis or a similar ephemeral store
 */
export async function storeGuestScanData(
  images: string[],
  result: GuestVerificationResult
): Promise<string> {
  // Generate a simple scan ID
  const scanId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // In a real implementation, store in Redis/Vercel KV with TTL
  // For now, we rely on localStorage on the client side
  
  return scanId;
}
