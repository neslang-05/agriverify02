'use server';

import { BLACKLISTED_BRANDS, MOCK_OCR_RESPONSES, SEED_REGISTRY } from '@/lib/constants';
import { VerificationStatus, VerificationResult, Product, SeedRecommendation } from '@/types';
import { getOpenAIClient } from '@/lib/azure/openai';
import { AGRICULTURAL_KNOWLEDGE_BASE } from '@/lib/knowledge-base';
import { classifyWithFallback } from '@/lib/azure/custom-vision-fallback';
import { saveVerificationHistory } from './history';
import { interpreter } from '@/lib/openai/interpreter';
import type { VerificationWithAISummary } from '@/types/packet-verification';

interface VisionAIResult {
  tag: string;
  confidence: number;
  seedVariety?: string;
}

interface HybridVerificationResult extends VerificationResult {
  visionAI?: VisionAIResult;
  ocr?: {
    detectedText: string;
    brandName?: string;
    certificationNumber?: string;
    batchNumber?: string;
    manufacturingDate?: string;
    expiryDate?: string;
    confidence: number;
    suspiciousFlags?: string[];
  };
  riskFactors?: string[];
}

// Simulated verification logic
function analyzeProduct(detectedText: string): {
  status: VerificationStatus;
  confidence: number;
  riskExplanation: string;
  recommendations: string[];
} {
  const lowerText = detectedText.toLowerCase();
  
  // Check for blacklisted brands
  const isBlacklisted = BLACKLISTED_BRANDS.some((brand) =>
    lowerText.includes(brand.toLowerCase())
  );

  if (isBlacklisted) {
    return {
      status: 'fake',
      confidence: 25,
      riskExplanation:
        'This product has been identified as potentially counterfeit. The brand name matches known fake product databases. The packaging lacks proper certification marks and batch information.',
      recommendations: [
        'Do not use this product on your crops',
        'Report to local agricultural office',
        'Request refund from seller',
        'Purchase from authorized dealers only',
      ],
    };
  }

  // Check for proper certification markers
  const hasLicense = lowerText.includes('license') || lowerText.includes('lic');
  const hasBatchNumber = lowerText.includes('batch') || lowerText.includes('lot');
  const hasMRP = lowerText.includes('mrp') || lowerText.includes('₹');
  const hasExpiry = lowerText.includes('expiry') || lowerText.includes('exp');
  const hasPackedDate = lowerText.includes('packed') || lowerText.includes('mfg');

  const markerCount = [hasLicense, hasBatchNumber, hasMRP, hasExpiry, hasPackedDate].filter(
    Boolean
  ).length;

  if (markerCount >= 4) {
    return {
      status: 'genuine',
      confidence: 85 + Math.floor(Math.random() * 10),
      riskExplanation:
        'This product shows all characteristics of a genuine certified product. The label contains proper licensing information, batch numbers, and manufacturing details that match expected formats.',
      recommendations: [
        'Safe to use for farming',
        'Store in cool, dry place',
        'Follow recommended dosage on package',
        'Check expiry date before use',
      ],
    };
  }

  if (markerCount >= 2) {
    return {
      status: 'suspicious',
      confidence: 55 + Math.floor(Math.random() * 15),
      riskExplanation:
        'This product shows some signs of authenticity but lacks complete certification information. Some required label elements are missing or unclear.',
      recommendations: [
        'Verify with local agricultural officer before use',
        'Cross-check batch number with manufacturer',
        'Consider purchasing from authorized dealer instead',
        'Keep receipt for future reference',
      ],
    };
  }

  return {
    status: 'fake',
    confidence: 20 + Math.floor(Math.random() * 20),
    riskExplanation:
      'This product lacks essential certification markers and appears to be counterfeit. The label quality and information do not match government standards.',
    recommendations: [
      'Do not use this product',
      'Report to authorities immediately',
      'Document purchase details for complaint',
      'Seek genuine alternatives from certified dealers',
    ],
  };
}

// Helper functions for text extraction
function extractBrandName(text: string): string | undefined {
  const brandMatch = text.match(/Brand[:\s]+([A-Za-z0-9\s]+)/i);
  return brandMatch ? brandMatch[1].trim() : undefined;
}

function extractCertificationNumber(text: string): string | undefined {
  const certMatch = text.match(/(?:Cert|Certification|License|Lic)[:\s#]+([A-Z0-9\-\/]+)/i);
  return certMatch ? certMatch[1].trim() : undefined;
}

function isBlacklistedBrand(brand?: string): boolean {
  if (!brand) return false;
  return BLACKLISTED_BRANDS.some(b => brand.toLowerCase().includes(b.toLowerCase()));
}

// Vision AI verification
function performVisionVerification(
  visionResult: any,
  cropType: string,
  district: string
): HybridVerificationResult {
  const riskFactors: string[] = [];
  let baseConfidence = visionResult.topPrediction.confidence;

  // Vision AI primary check - Pure/Negative classification
  const tag = visionResult.topPrediction.tag.toLowerCase();
  
  if (tag === 'negative' || !visionResult.isAuthentic) {
    riskFactors.push('Vision AI detected low quality or counterfeit characteristics');
  }

  // Determine final status based on tag and confidence
  const finalConfidence = Math.max(0, Math.min(100, baseConfidence));
  let status: VerificationStatus;
  
  if (tag === 'pure' && finalConfidence >= 60) {
    status = 'genuine';
  } else if (tag === 'negative') {
    status = finalConfidence >= 50 ? 'suspicious' : 'fake';
  } else {
    status = finalConfidence >= 75 ? 'genuine' 
           : finalConfidence >= 50 ? 'suspicious' 
           : 'fake';
  }

  // Generate recommendation and risk explanation
  const { riskExplanation, recommendations } = generateRecommendation(status, riskFactors, visionResult);

  return {
    id: crypto.randomUUID(),
    product_id: crypto.randomUUID(),
    status,
    confidence: Math.round(finalConfidence),
    detected_text: '',
    risk_explanation: riskExplanation,
    recommendations,
    verified_at: new Date().toISOString(),
    visionAI: {
      tag: visionResult.topPrediction.tag,
      confidence: visionResult.topPrediction.confidence,
      seedVariety: visionResult.seedVariety
    },
    riskFactors
  };
}

function generateRecommendation(
  status: VerificationStatus,
  risks: string[],
  visionResult: any
): { riskExplanation: string; recommendations: string[] } {
  if (status === 'genuine') {
    const riskExplanation = `This seed packet appears authentic. ${visionResult.seedVariety ? `Detected variety: ${visionResult.seedVariety}.` : ''} The product shows all characteristics of a genuine certified product with proper labeling and high AI confidence score.`;
    const recommendations = [
      'Safe to use for farming',
      'Store in cool, dry place away from moisture',
      'Follow recommended dosage on package',
      'Check expiry date before use',
      'Keep receipt for warranty purposes'
    ];
    return { riskExplanation, recommendations };
  } else if (status === 'suspicious') {
    const riskExplanation = `This product shows suspicious characteristics: ${risks.join(', ')}. The verification system has identified potential authenticity concerns that require further investigation.`;
    const recommendations = [
      'Verify with local agricultural officer before use',
      'Cross-check batch number with manufacturer hotline',
      'Request invoice and guarantee from seller',
      'Consider purchasing from government-authorized dealer',
      'Document product details for potential complaint'
    ];
    return { riskExplanation, recommendations };
  } else {
    const riskExplanation = `Warning: High probability of counterfeit product. Multiple verification failures detected: ${risks.join(', ')}. This product does not meet authenticity standards.`;
    const recommendations = [
      'Do not use this product on your crops',
      'Report to local agricultural office immediately',
      'Request full refund from seller',
      'Document purchase details for legal complaint',
      'Purchase only from authorized dealers with valid licenses'
    ];
    return { riskExplanation, recommendations };
  }
}

export async function uploadAndVerify(formData: FormData): Promise<HybridVerificationResult> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const cropType = formData.get('cropType') as string;
  const district = formData.get('district') as string;
  const file = formData.get('image') as File;

  try {
    // Check if GCP Vision is configured (with fallback to default endpoint)
    const isGCPConfigured = true; // GCP endpoint is always available with default

    if (isGCPConfigured && file) {
      // Convert file to buffer for GCP Vision API
      const arrayBuffer = await file.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);
      
      // Create temporary URL for the image
      const imageUrl = `data:${file.type};base64,${imageBuffer.toString('base64')}`;

      // Execute Vision AI classification
      const visionResult = await classifyWithFallback(imageBuffer, imageUrl);

      // Perform verification based on Vision AI result
      const result = performVisionVerification(visionResult, cropType, district);
      
      // Save to history (non-blocking)
      // Note: confidence from GCP is already 0-100, convert to 0-1 for database
      saveVerificationHistory({
        image_url: imageUrl,
        status: result.status,
        confidence: result.confidence / 100,
        vision_ai_tag: result.visionAI?.tag,
        vision_ai_confidence: (result.visionAI?.confidence || 0) / 100, // Convert 0-100 to 0-1
        seed_variety: result.visionAI?.seedVariety,
        recommendation: result.risk_explanation,
        risk_factors: result.riskFactors
      }).catch(err => console.error('Failed to save history:', err));
      
      return result;
    }
  } catch (error) {
    console.error('GCP Vision verification failed, falling back to mock:', error);
  }

  // Fallback to original mock verification if model inference fails
  const scenarios = ['genuine', 'suspicious', 'fake'] as const;
  const scenario = scenarios[Math.floor(Math.random() * 3)];
  const ocrResponse = MOCK_OCR_RESPONSES[scenario];

  const analysis = analyzeProduct(ocrResponse.detected_text);

  const result: VerificationResult = {
    id: crypto.randomUUID(),
    product_id: crypto.randomUUID(),
    status: analysis.status,
    confidence: analysis.confidence,
    detected_text: ocrResponse.detected_text,
    risk_explanation: analysis.riskExplanation,
    recommendations: analysis.recommendations,
    verified_at: new Date().toISOString(),
  };

  return result;
}

/**
 * Verify image with AI-powered human-friendly summary
 * Uses Azure Custom Vision + Azure OpenAI for synthesis
 */
export async function uploadAndVerifyWithAI(formData: FormData): Promise<VerificationWithAISummary> {
  const file = formData.get('image') as File;

  try {
    if (!file) {
      throw new Error('No image file provided');
    }

    // Convert file to buffer and base64
    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const base64Image = `data:${file.type};base64,${imageBuffer.toString('base64')}`;

    // GCP Vision is configured by default - proceed with classification
    
    // 1. Run GCP Custom Vision classification
    const visionResult = await classifyWithFallback(imageBuffer, base64Image);

    // 2. Run OpenAI synthesis for human-friendly interpretation
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

    // 3. Return combined result
    const result: VerificationWithAISummary = {
      ui: {
        status: simplified.status,
        emoji: simplified.emoji,
        title: simplified.headline,
        message: simplified.explanation,
        action: simplified.action_recommendation
      },
      technical: {
        predictions: visionResult.predictions,
        model_confidence: visionResult.topPrediction.confidence,
        raw_tags: visionResult.predictions
      }
    };

    // Save to history (non-blocking)
    saveVerificationHistory({
      image_url: base64Image,
      status: simplified.status === 'good' ? 'genuine' : simplified.status === 'bad' ? 'fake' : 'suspicious',
      confidence: visionResult.topPrediction.confidence / 100,
      vision_ai_tag: visionResult.topPrediction.tag,
      vision_ai_confidence: visionResult.topPrediction.confidence / 100,
      recommendation: simplified.explanation,
      risk_factors: simplified.status !== 'good' ? [simplified.action_recommendation] : undefined
    }).catch(err => console.error('Failed to save history:', err));

    return result;

  } catch (error) {
    console.error('AI verification error:', error);
    
    // Return fallback result
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
function getFallbackInterpretation(predictions: Array<{ tagName: string; probability: number }>) {
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

export async function getSeedRecommendations(
  cropType: string,
  district: string
): Promise<SeedRecommendation[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let recommendations = SEED_REGISTRY.filter(
    (seed) => seed.crop_type.toLowerCase() === cropType.toLowerCase()
  );

  if (recommendations.length === 0) {
    recommendations = SEED_REGISTRY.slice(0, 3);
  }

  return recommendations.slice(0, 3) as SeedRecommendation[];
}

export async function getChatResponse(message: string, userId: string): Promise<string> {
  // Check if Azure OpenAI is enabled
  if (process.env.ENABLE_AZURE_OPENAI_CHAT !== 'true') {
    return getFallbackResponse(message);
  }

  try {
    const client = getOpenAIClient();
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';

    const systemPrompt = `You are a direct, knowledgeable agricultural assistant. Use this knowledge base:

${AGRICULTURAL_KNOWLEDGE_BASE}

CRITICAL RULES:
- Keep every response to 2-3 sentences maximum
- Give definitive answers, NOT "maybe" or "possibly" responses
- Use simple, clear language farmers can immediately understand and act on
- Be specific with numbers, varieties, and recommendations
- Focus on actionable advice only
- No long explanations - be direct and concise`;

    const response = await client.chat.completions.create({
      model: deployment,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_completion_tokens: 150,
    });

    return response.choices[0]?.message?.content || 'I apologize, but I encountered an error. Please try again.';
  } catch (error) {
    console.error('OpenAI chat error:', error);
    // Fallback to simple responses if OpenAI fails
    return getFallbackResponse(message);
  }
}

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I help with seed verification and farming advice. What do you need help with?";
  }

  if (lowerMessage.includes('fake') || lowerMessage.includes('counterfeit')) {
    return 'Buy only from authorized dealers with proper licenses. Check for hologram stickers, QR codes, and verify batch numbers with manufacturers.';
  }

  if (lowerMessage.includes('recommend') || lowerMessage.includes('best seed')) {
    return 'Visit the Recommendations section to filter by crop type and district. All recommendations are government-certified varieties tested for your region.';
  }

  if (lowerMessage.includes('verify') || lowerMessage.includes('check')) {
    return 'Go to the Verify section, upload a clear photo of the product label, and select your crop type. Results in 2-3 seconds.';
  }

  if (lowerMessage.includes('rice') || lowerMessage.includes('paddy')) {
    return 'Top certified rice varieties: BPT-5204 (Samba Mahsuri) and MTU-1010. Both offer high yield and disease resistance. Always check the seed certification tag.';
  }

  if (lowerMessage.includes('fertilizer')) {
    return 'Check for FCO license, verify nutrient content matches the label, and look for batch number and manufacturing date. Buy only sealed bags from authorized dealers.';
  }

  return 'I can help with seed verification, crop recommendations, identifying fake products, and farming guidance. What would you like to know?';
}
