'use server';

import { gcpVisionService } from '@/lib/gcp-vision';
import { interpreter } from '@/lib/openai/interpreter';
import type { VerificationWithAISummary } from '@/types/packet-verification';

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
          return await gcpVisionService.classifyImage(buffer);
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

/**
 * Process single seed image with AI-powered synthesis
 * Uses Google Cloud Run ResNet Model for technical analysis + Azure OpenAI for human-friendly interpretation
 */
export async function processSeedImageWithAI(
  base64Image: string
): Promise<VerificationWithAISummary> {
  try {
    // 1. Get Image Buffer
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // 2. Run GCP Vision (The "Hard" Data)
    const visionResult = await gcpVisionService.classifyImage(buffer);

    // 3. Run OpenAI Synthesis (The "Soft" Interpretation)
    // Pass both the visual and the data for context
    let simplified;
    try {
      simplified = await interpreter.synthesizeResult(base64Image, visionResult.predictions);
      
      // Check if it's actually a seed image
      if (!simplified.is_seed_image) {
        // Return error for non-seed images
        return {
          ui: {
            status: 'bad',
            emoji: '❌',
            title: simplified.headline || 'Not a Seed Image',
            message: simplified.explanation,
            action: simplified.action_recommendation
          },
          technical: {
            predictions: [],
            model_confidence: 0,
            raw_tags: []
          }
        };
      }
    } catch (error) {
      console.error('OpenAI synthesis failed, using fallback:', error);
      // Fallback to rule-based interpretation
      simplified = getFallbackInterpretation(visionResult.predictions);
    }

    // 4. Return Combined Object
    return {
      // Simplified view for the UI Card
      ui: {
        status: simplified.status,
        emoji: simplified.emoji,
        title: simplified.headline,
        message: simplified.explanation,
        action: simplified.action_recommendation
      },
      // Full technical data for detailed view / Officer Dashboard / Database
      technical: {
        predictions: visionResult.predictions,
        model_confidence: visionResult.topPrediction.confidence,
        raw_tags: visionResult.predictions
      }
    };

  } catch (error) {
    console.error('AI verification error:', error);
    
    // Return a safe fallback result
    return {
      ui: {
        status: 'bad',
        emoji: '⚠️',
        title: 'Analysis Unavailable',
        message: "We couldn't analyze the image at this time. Please ensure you have a clear photo and try again.",
        action: "Try again or contact support if the issue persists."
      },
      technical: {
        predictions: [],
        model_confidence: 0,
        raw_tags: []
      }
    };
  }
}

/**
 * Fallback interpretation when OpenAI is unavailable
 */
function getFallbackInterpretation(predictions: Prediction[]) {
  const top = [...predictions].sort((a, b) => b.probability - a.probability)[0];
  const isPure = top.tagName.toLowerCase().includes('pure') || 
                 top.tagName.toLowerCase().includes('genuine') ||
                 top.tagName.toLowerCase().includes('authentic');
  const isGood = isPure && top.probability > 0.6;
  const isAverage = top.probability > 0.4 && top.probability <= 0.6;
  
  if (isGood) {
    return {
      status: 'good' as const,
      emoji: '🟢',
      headline: 'Quality Looks Good',
      explanation: "The seeds appear uniform and healthy. This batch shows high purity with minimal impurities.",
      action_recommendation: "Safe to use for planting.",
      is_seed_image: true
    };
  } else if (isAverage) {
    return {
      status: 'average' as const,
      emoji: '🟡',
      headline: 'Quality Needs Attention',
      explanation: "We detected some impurities or broken seeds in this sample. The quality is acceptable but not optimal.",
      action_recommendation: "Consider cleaning the seeds before use.",
      is_seed_image: true
    };
  } else {
    return {
      status: 'bad' as const,
      emoji: '🔴',
      headline: 'Quality Concerns Detected',
      explanation: "We detected significant impurities or broken seeds in this sample. This may affect crop yield.",
      action_recommendation: "Consider filing a complaint or requesting replacement from your dealer.",
      is_seed_image: true
    };
  }
}
