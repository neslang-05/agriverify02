# GitHub Copilot Custom Agent Instructions
## Azure Custom Vision AI - Paddy Seed Classification Integration

You are an **expert cloud integration engineer** tasked with integrating Azure Custom Vision AI model for paddy seed classification into the existing Next.js agricultural verification application.

---

## Integration Overview

### Objective
Replace the existing mock verification logic with **Azure Custom Vision** model predictions for accurate paddy seed authenticity detection and classification.

### Architecture Changes
```
Existing Flow:
User Upload → OCR → Rule-based Verification → Result

New Flow:
User Upload → Azure Custom Vision API → Classification Result
                    ↓
              OCR (parallel) → Text Extraction
                    ↓
              Hybrid Verification (Vision AI + OCR + Rules)
                    ↓
              Enhanced Result with Confidence
```

---

## Azure Custom Vision Setup Requirements

### Required Configuration
```typescript
// Environment variables to add in .env.local

AZURE_CUSTOM_VISION_PREDICTION_URL=https://<your-resource>.cognitiveservices.azure.com/customvision/v3.0/Prediction/<project-id>/classify/iterations/<iteration-name>/image
AZURE_CUSTOM_VISION_PREDICTION_KEY=<your-prediction-key>
AZURE_CUSTOM_VISION_PROJECT_ID=<your-project-id>
AZURE_CUSTOM_VISION_ITERATION_NAME=<published-iteration-name>
AZURE_CUSTOM_VISION_ENDPOINT=https://<your-resource>.cognitiveservices.azure.com

# Optional: for multi-model support
AZURE_CUSTOM_VISION_FERTILIZER_URL=<fertilizer-model-url>
AZURE_CUSTOM_VISION_FERTILIZER_KEY=<fertilizer-prediction-key>
```

### SDK Installation
```bash
npm install @azure/cognitiveservices-customvision-prediction
npm install @azure/ms-rest-js
```

---

## Implementation Tasks

### 1. Create Azure Custom Vision Service

**File: `lib/azure/custom-vision.ts`**

```typescript
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
  private client: PredictionAPIClient;
  private projectId: string;
  private iterationName: string;

  constructor() {
    const predictionKey = process.env.AZURE_CUSTOM_VISION_PREDICTION_KEY!;
    const endpoint = process.env.AZURE_CUSTOM_VISION_ENDPOINT!;
    this.projectId = process.env.AZURE_CUSTOM_VISION_PROJECT_ID!;
    this.iterationName = process.env.AZURE_CUSTOM_VISION_ITERATION_NAME!;

    const credentials = new ApiKeyCredentials({
      inHeader: { 'Prediction-Key': predictionKey }
    });

    this.client = new PredictionAPIClient(credentials, endpoint);
  }

  /**
   * Classify paddy seed image using Azure Custom Vision
   */
  async classifyImage(imageBuffer: Buffer): Promise<VisionClassificationResult> {
    try {
      const result = await this.client.classifyImage(
        this.projectId,
        this.iterationName,
        imageBuffer
      );

      const predictions = result.predictions.map(pred => ({
        tagName: pred.tagName,
        probability: pred.probability
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
      const result = await this.client.classifyImageUrl(
        this.projectId,
        this.iterationName,
        { url: imageUrl }
      );

      const predictions = result.predictions.map(pred => ({
        tagName: pred.tagName,
        probability: pred.probability
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
   * Adjust logic based on your Custom Vision model's tag structure
   */
  private determineAuthenticity(tag: string, probability: number): boolean {
    // Example logic - adjust based on your model
    const authenticTags = ['genuine', 'authentic', 'certified', 'original'];
    const fakeTags = ['fake', 'counterfeit', 'suspicious', 'duplicate'];

    const tagLower = tag.toLowerCase();

    if (fakeTags.some(fakeTag => tagLower.includes(fakeTag))) {
      return false;
    }

    if (authenticTags.some(authTag => tagLower.includes(authTag))) {
      return probability >= 0.7; // 70% confidence threshold
    }

    // For variety-based tags (e.g., "BPT-5204-Genuine")
    // Check confidence threshold
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
```

---

### 2. Update Verification Server Action

**File: `app/actions/verification.ts`**

```typescript
'use server';

import { customVisionService } from '@/lib/azure/custom-vision';
import { supabase } from '@/lib/supabase/client';
import { googleVisionService } from '@/lib/google/vision'; // Existing OCR service

interface VerificationInput {
  imageBuffer: Buffer;
  imageUrl: string;
  cropType: string;
  district: string;
  userId: string;
}

interface HybridVerificationResult {
  status: 'genuine' | 'suspicious' | 'fake';
  confidence: number;
  visionAI: {
    tag: string;
    confidence: number;
    seedVariety?: string;
  };
  ocr: {
    detectedText: string;
    brandName?: string;
    certificationNumber?: string;
  };
  riskFactors: string[];
  recommendation: string;
}

export async function verifyProductWithAzureVision(
  input: VerificationInput
): Promise<HybridVerificationResult> {
  try {
    // Parallel execution: Vision AI + OCR
    const [visionResult, ocrResult] = await Promise.all([
      customVisionService.classifyImageUrl(input.imageUrl),
      googleVisionService.extractText(input.imageUrl) // Existing OCR
    ]);

    // Hybrid verification logic
    const verification = performHybridVerification(visionResult, ocrResult, input);

    // Store in database
    const { data: product } = await supabase
      .from('products')
      .insert({
        user_id: input.userId,
        image_url: input.imageUrl,
        brand_name: verification.ocr.brandName || 'Unknown',
        detected_text: verification.ocr.detectedText,
        verification_status: verification.status,
        confidence: verification.confidence,
        crop_type: input.cropType,
        district: input.district,
        vision_ai_tag: verification.visionAI.tag,
        vision_ai_confidence: verification.visionAI.confidence,
        seed_variety: verification.visionAI.seedVariety
      })
      .select()
      .single();

    // Log verification
    await supabase.from('verification_logs').insert({
      product_id: product.id,
      status: verification.status,
      risk_score: 100 - verification.confidence,
      district: input.district,
      vision_ai_used: true
    });

    return verification;
  } catch (error) {
    console.error('Verification error:', error);
    throw new Error('Failed to verify product');
  }
}

/**
 * Hybrid verification combining Vision AI + OCR + Rules
 */
function performHybridVerification(
  visionResult: any,
  ocrResult: any,
  input: VerificationInput
): HybridVerificationResult {
  const riskFactors: string[] = [];
  let baseConfidence = visionResult.topPrediction.confidence;

  // Vision AI primary check
  if (!visionResult.isAuthentic) {
    riskFactors.push('Vision AI detected counterfeit characteristics');
    baseConfidence = Math.min(baseConfidence, 50);
  }

  // OCR validation checks
  const brandName = extractBrandName(ocrResult.detectedText);
  const certNumber = extractCertificationNumber(ocrResult.detectedText);

  if (!certNumber) {
    riskFactors.push('Missing certification number on packaging');
    baseConfidence -= 15;
  }

  if (isBlacklistedBrand(brandName)) {
    riskFactors.push('Brand flagged in counterfeit database');
    baseConfidence -= 25;
  }

  // OCR quality check
  if (ocrResult.confidence < 0.7) {
    riskFactors.push('Poor label quality or tampering suspected');
    baseConfidence -= 10;
  }

  // Cross-validation: Vision AI variety vs OCR text
  if (visionResult.seedVariety && brandName) {
    if (!ocrResult.detectedText.includes(visionResult.seedVariety)) {
      riskFactors.push('Mismatch between visual characteristics and label text');
      baseConfidence -= 20;
    }
  }

  // Determine final status
  const finalConfidence = Math.max(0, Math.min(100, baseConfidence));
  const status = finalConfidence >= 75 ? 'genuine' 
               : finalConfidence >= 50 ? 'suspicious' 
               : 'fake';

  // Generate recommendation
  const recommendation = generateRecommendation(status, riskFactors, visionResult);

  return {
    status,
    confidence: finalConfidence,
    visionAI: {
      tag: visionResult.topPrediction.tag,
      confidence: visionResult.topPrediction.confidence,
      seedVariety: visionResult.seedVariety
    },
    ocr: {
      detectedText: ocrResult.detectedText,
      brandName,
      certificationNumber: certNumber
    },
    riskFactors,
    recommendation
  };
}

// Helper functions
function extractBrandName(text: string): string | undefined {
  // Extract brand name logic
  const brandMatch = text.match(/Brand[:\s]+([A-Za-z0-9\s]+)/i);
  return brandMatch ? brandMatch[1].trim() : undefined;
}

function extractCertificationNumber(text: string): string | undefined {
  // Extract cert number logic
  const certMatch = text.match(/(?:Cert|Certification|License)[:\s#]+([A-Z0-9\-\/]+)/i);
  return certMatch ? certMatch[1].trim() : undefined;
}

function isBlacklistedBrand(brand?: string): boolean {
  if (!brand) return false;
  const blacklist = ['FakeBrand', 'CounterfeitCo']; // Load from database
  return blacklist.some(b => brand.toLowerCase().includes(b.toLowerCase()));
}

function generateRecommendation(
  status: string,
  risks: string[],
  visionResult: any
): string {
  if (status === 'genuine') {
    return `This seed packet appears authentic. ${visionResult.seedVariety ? `Detected variety: ${visionResult.seedVariety}.` : ''} Proceed with purchase from authorized dealers.`;
  } else if (status === 'suspicious') {
    return `This product shows suspicious characteristics: ${risks.join(', ')}. Verify with agricultural department before use.`;
  } else {
    return `Warning: High probability of counterfeit product. Do not purchase. Report to authorities. Issues: ${risks.join(', ')}.`;
  }
}
```

---

### 3. Update Database Schema

**File: `supabase/migrations/add_vision_ai_fields.sql`**

```sql
-- Add Azure Vision AI related columns to products table
ALTER TABLE products
ADD COLUMN vision_ai_tag TEXT,
ADD COLUMN vision_ai_confidence NUMERIC(5,2),
ADD COLUMN seed_variety TEXT,
ADD COLUMN vision_ai_predictions JSONB;

-- Add index for vision AI tag searches
CREATE INDEX idx_products_vision_tag ON products(vision_ai_tag);
CREATE INDEX idx_products_seed_variety ON products(seed_variety);

-- Update verification_logs table
ALTER TABLE verification_logs
ADD COLUMN vision_ai_used BOOLEAN DEFAULT false,
ADD COLUMN vision_ai_confidence NUMERIC(5,2);

-- Create table for Vision AI model metadata
CREATE TABLE vision_ai_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name TEXT NOT NULL,
  iteration_name TEXT NOT NULL,
  project_id TEXT NOT NULL,
  crop_type TEXT,
  accuracy_metrics JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### 4. Update UI Components

**File: `components/farmer/VerificationResult.tsx`**

```typescript
'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

interface VerificationResultProps {
  result: {
    status: 'genuine' | 'suspicious' | 'fake';
    confidence: number;
    visionAI: {
      tag: string;
      confidence: number;
      seedVariety?: string;
    };
    ocr: {
      detectedText: string;
      brandName?: string;
    };
    riskFactors: string[];
    recommendation: string;
  };
}

export function VerificationResult({ result }: VerificationResultProps) {
  const statusConfig = {
    genuine: {
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
      label: 'Genuine Product'
    },
    suspicious: {
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      label: 'Suspicious - Verify Further'
    },
    fake: {
      icon: XCircle,
      color: 'text-error',
      bgColor: 'bg-error/10',
      label: 'Counterfeit Detected'
    }
  };

  const config = statusConfig[result.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Main Status Card */}
      <Card className="rounded-none shadow-lg border-none">
        <CardContent className="p-6">
          <div className={`flex items-center gap-4 p-4 ${config.bgColor} mb-6`}>
            <StatusIcon className={`h-8 w-8 ${config.color}`} />
            <div>
              <h3 className="text-xl font-semibold text-text-primary">{config.label}</h3>
              <p className="text-sm text-text-secondary">Confidence: {result.confidence.toFixed(1)}%</p>
            </div>
          </div>

          <Progress value={result.confidence} className="h-2 rounded-none mb-4" />

          {/* AI Vision Analysis */}
          <div className="space-y-4 mt-6">
            <div className="flex items-center gap-2 text-primary-800">
              <Sparkles className="h-5 w-5" />
              <h4 className="font-semibold">AI Vision Analysis</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-secondary">Detected Classification</p>
                <p className="font-medium text-text-primary">{result.visionAI.tag}</p>
              </div>
              
              {result.visionAI.seedVariety && (
                <div>
                  <p className="text-sm text-text-secondary">Seed Variety</p>
                  <Badge variant="outline" className="rounded-none font-medium">
                    {result.visionAI.seedVariety}
                  </Badge>
                </div>
              )}
              
              <div>
                <p className="text-sm text-text-secondary">AI Confidence</p>
                <p className="font-medium text-text-primary">
                  {result.visionAI.confidence.toFixed(1)}%
                </p>
              </div>
              
              {result.ocr.brandName && (
                <div>
                  <p className="text-sm text-text-secondary">Brand Name</p>
                  <p className="font-medium text-text-primary">{result.ocr.brandName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Risk Factors */}
          {result.riskFactors.length > 0 && (
            <div className="mt-6 p-4 bg-background-secondary">
              <h4 className="font-semibold text-text-primary mb-2">Risk Factors Identified:</h4>
              <ul className="space-y-1">
                {result.riskFactors.map((risk, idx) => (
                  <li key={idx} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-warning mt-1">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendation */}
          <div className="mt-6 p-4 border-l-4 border-primary-800 bg-primary-50">
            <p className="text-sm text-text-primary">{result.recommendation}</p>
          </div>
        </CardContent>
      </Card>

      {/* OCR Text Preview */}
      <Card className="rounded-none shadow-md border-none">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg">Extracted Label Text</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <pre className="text-sm text-text-secondary whitespace-pre-wrap font-mono bg-background-secondary p-4">
            {result.ocr.detectedText || 'No text detected'}
          </pre>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

---

### 5. Error Handling & Fallback

**File: `lib/azure/custom-vision-fallback.ts`**

```typescript
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
```

---

### 6. Testing Strategy

**File: `__tests__/azure-vision.test.ts`**

```typescript
import { customVisionService } from '@/lib/azure/custom-vision';
import fs from 'fs';

describe('Azure Custom Vision Integration', () => {
  test('should classify genuine paddy seed image', async () => {
    const imageBuffer = fs.readFileSync('./test-images/genuine-seed.jpg');
    const result = await customVisionService.classifyImage(imageBuffer);
    
    expect(result.topPrediction.confidence).toBeGreaterThan(70);
    expect(result.isAuthentic).toBe(true);
  });

  test('should detect fake seed packaging', async () => {
    const imageBuffer = fs.readFileSync('./test-images/fake-seed.jpg');
    const result = await customVisionService.classifyImage(imageBuffer);
    
    expect(result.isAuthentic).toBe(false);
  });

  test('should handle API errors gracefully', async () => {
    // Test with invalid buffer
    await expect(
      customVisionService.classifyImage(Buffer.from(''))
    ).rejects.toThrow();
  });
});
```

---

## Configuration Checklist

- [ ] Azure Custom Vision model trained and published
- [ ] Prediction endpoint URL obtained from Azure portal
- [ ] Prediction key added to environment variables
- [ ] Project ID and iteration name configured
- [ ] SDK packages installed (@azure/cognitiveservices-customvision-prediction)
- [ ] Database schema updated with vision AI columns
- [ ] Server actions updated to use Azure Vision API
- [ ] UI components updated to display AI predictions
- [ ] Error handling and fallback logic implemented
- [ ] Rate limiting configured (Azure Free tier: 10 TPS)
- [ ] Monitoring and logging added for API calls
- [ ] Cost tracking enabled in Azure portal

---

## Performance Optimization

1. **Caching**: Cache predictions for identical images (hash-based)
2. **Compression**: Compress images before sending to Azure (max 4MB)
3. **Batch Processing**: Use batch API for multiple images
4. **Async Processing**: Don't block UI, use loading states
5. **Retry Logic**: Implement exponential backoff for failed requests

---

## Monitoring & Analytics

Add tracking for:
- Azure API response times
- Prediction confidence distribution
- Accuracy metrics (genuine vs fake detection rate)
- False positive/negative rates
- API error rates and types

---

**Begin integration step by step. Ensure Azure credentials are secure and never committed to version control.**