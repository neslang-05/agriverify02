'use server';

import { BLACKLISTED_BRANDS, MOCK_OCR_RESPONSES, SEED_REGISTRY } from '@/lib/constants';
import { VerificationStatus, VerificationResult, Product, SeedRecommendation } from '@/types';
import { getOpenAIClient } from '@/lib/azure/openai';
import { AGRICULTURAL_KNOWLEDGE_BASE } from '@/lib/knowledge-base';

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

export async function uploadAndVerify(formData: FormData): Promise<VerificationResult> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const cropType = formData.get('cropType') as string;
  const district = formData.get('district') as string;

  // Randomly select OCR response for demo
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
  // Check if Azure OpenAI is enabled
  if (process.env.ENABLE_AZURE_OPENAI_CHAT !== 'true') {
    return getFallbackResponse(message);
  }

  try {
    const client = getOpenAIClient();
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';

    const systemPrompt = `You are an agricultural assistant specializing in seed verification, farming practices, and crop recommendations. You have access to the following knowledge base:

${AGRICULTURAL_KNOWLEDGE_BASE}

Instructions:
- Provide helpful, accurate information based on the knowledge base
- Be friendly and professional
- If asked about seed verification, guide users to use the verification system
- For crop recommendations, suggest certified varieties and best practices
- Always emphasize buying from authorized dealers and checking certifications
- If you don't have specific information, suggest consulting local agricultural experts
- Keep responses concise but informative
- Use simple language that farmers can understand`;

    const response = await client.chat.completions.create({
      model: deployment,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_completion_tokens: 500,
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
