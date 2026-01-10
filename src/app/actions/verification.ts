'use server';

import { BLACKLISTED_BRANDS, MOCK_OCR_RESPONSES, SEED_REGISTRY } from '@/lib/constants';
import { VerificationStatus, VerificationResult, Product, SeedRecommendation } from '@/types';
import { classifyWithFallback } from '@/lib/azure/custom-vision-fallback';
import { performOCR, OCRResult } from '@/lib/azure/computer-vision-ocr';
import { saveVerificationHistory } from './history';

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

// Vision AI verification with OCR
function performVisionVerification(
  visionResult: any,
  cropType: string,
  district: string,
  ocrResult?: OCRResult
): HybridVerificationResult {
  const riskFactors: string[] = [];
  let baseConfidence = visionResult.topPrediction.confidence;

  // Vision AI primary check - Pure/Negative classification
  const tag = visionResult.topPrediction.tag.toLowerCase();
  
  if (tag === 'negative' || !visionResult.isAuthentic) {
    riskFactors.push('Vision AI detected low quality or counterfeit characteristics');
  }

  // Add OCR-based risk factors if available
  if (ocrResult && ocrResult.suspiciousFlags && ocrResult.suspiciousFlags.length > 0) {
    riskFactors.push(...ocrResult.suspiciousFlags);
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
    detected_text: ocrResult?.detectedText || '',
    risk_explanation: riskExplanation,
    recommendations,
    verified_at: new Date().toISOString(),
    visionAI: {
      tag: visionResult.topPrediction.tag,
      confidence: visionResult.topPrediction.confidence,
      seedVariety: visionResult.seedVariety
    },
    ocr: ocrResult ? {
      detectedText: ocrResult.detectedText,
      brandName: ocrResult.brandName,
      certificationNumber: ocrResult.certificationNumber,
      batchNumber: ocrResult.batchNumber,
      manufacturingDate: ocrResult.manufacturingDate,
      expiryDate: ocrResult.expiryDate,
      confidence: ocrResult.confidence * 100,
      suspiciousFlags: ocrResult.suspiciousFlags
    } : undefined,
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
    // Check if Azure Custom Vision is configured
    const isAzureConfigured = process.env.AZURE_CUSTOM_VISION_PREDICTION_KEY && 
                              process.env.AZURE_CUSTOM_VISION_ENDPOINT;

    if (isAzureConfigured && file) {
      // Convert file to buffer for Azure Vision API
      const arrayBuffer = await file.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);
      
      // Create temporary URL for the image
      const imageUrl = `data:${file.type};base64,${imageBuffer.toString('base64')}`;

      // Execute Vision AI classification and OCR in parallel
      const [visionResult, ocrResult] = await Promise.all([
        classifyWithFallback(imageBuffer, imageUrl),
        performOCR(imageBuffer).catch(err => {
          console.error('OCR failed:', err);
          return undefined;
        })
      ]);

      // Perform verification based on Vision AI result and OCR
      const result = performVisionVerification(visionResult, cropType, district, ocrResult);
      
      // Save to history (non-blocking)
      // Note: confidence from Azure is already 0-100, convert to 0-1 for database
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
    console.error('Azure Vision verification failed, falling back to mock:', error);
  }

  // Fallback to original mock verification if Azure is not configured or fails
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
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm your agricultural assistant. I can help you with seed verification, farming recommendations, and general agricultural queries. How can I assist you today?";
  }

  if (lowerMessage.includes('fake') || lowerMessage.includes('counterfeit')) {
    return 'Counterfeit seeds are a serious concern. To protect yourself: 1) Always buy from authorized dealers with proper licenses. 2) Check for hologram stickers and QR codes on packaging. 3) Verify batch numbers with the manufacturer. 4) Report suspicious products to your local agricultural office. Would you like me to help you verify a specific product?';
  }

  if (lowerMessage.includes('recommend') || lowerMessage.includes('best seed')) {
    return 'For the best seed recommendations, I suggest visiting the Recommendations section where you can filter by crop type and district. The recommendations are based on government-certified varieties that have been tested for your region. Would you like me to explain more about any specific crop?';
  }

  if (lowerMessage.includes('verify') || lowerMessage.includes('check')) {
    return 'To verify a seed or fertilizer product: 1) Go to the Verify section. 2) Upload a clear photo of the product label. 3) Select your crop type and district. 4) Our system will analyze the image and provide a verification result. The process takes about 2-3 seconds. Would you like to start a verification now?';
  }

  if (lowerMessage.includes('rice') || lowerMessage.includes('paddy')) {
    return 'For rice cultivation, I recommend certified varieties like BPT-5204 (Samba Mahsuri) or MTU-1010 depending on your region. These varieties have high yield potential and disease resistance. Make sure to check the seed certification tag and buy from authorized dealers. Need more specific recommendations for your district?';
  }

  if (lowerMessage.includes('fertilizer')) {
    return 'When purchasing fertilizers: 1) Check for FCO (Fertilizer Control Order) license. 2) Verify the nutrient content matches the label. 3) Look for the batch number and manufacturing date. 4) Buy only sealed bags from authorized dealers. Counterfeit fertilizers can damage your crops and soil health.';
  }

  return 'Thank you for your question. I can help you with: 1) Seed and fertilizer verification 2) Crop-specific recommendations 3) Identifying fake products 4) General farming guidance. Please feel free to ask about any of these topics, and I\'ll provide detailed information based on government guidelines and best agricultural practices.';
}
