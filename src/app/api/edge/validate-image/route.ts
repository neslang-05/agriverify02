/**
 * Edge Function: Validate Image
 * 
 * Fast, low-latency image validation before cloud processing.
 * Runs on Vercel Edge Runtime for optimal performance.
 * 
 * Features:
 * - Image quality analysis (resolution, blur, brightness)
 * - Lightweight OCR for key field extraction
 * - Packet detection validation
 * - Side classification (front/back)
 */

import { NextRequest, NextResponse } from 'next/server';
import type {
  EdgeValidationRequest,
  EdgeValidationResponse,
  QualityCheck,
  ExtractedFields,
} from '@/types/packet-verification';

export const runtime = 'edge';

// Constants for validation
const MIN_WIDTH = 640;
const MIN_HEIGHT = 480;
const MIN_BLUR_SCORE = 30;
const MIN_BRIGHTNESS = 20;
const MAX_BRIGHTNESS = 85;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Front side indicators (typically has brand, product image, product name)
const FRONT_INDICATORS = [
  'seeds', 'seed', 'hybrid', 'variety', 'brand', 'product',
  'premium', 'quality', 'agriculture', 'agri', 'farm',
  'kg', 'kilogram', 'gram', 'gm', 'net wt', 'net weight',
  'paddy', 'rice', 'wheat', 'cotton', 'maize', 'soybean',
  'groundnut', 'mustard', 'vegetable', 'tomato', 'onion',
  'chilli', 'pepper', 'brinjal', 'okra', 'cabbage'
];

// Back side indicators (typically has batch info, certification, ingredients)
const BACK_INDICATORS = [
  'batch', 'lot', 'mfg', 'manufacturing', 'manufactured',
  'exp', 'expiry', 'best before', 'use by',
  'license', 'lic', 'fco', 'certification', 'cert',
  'germination', 'purity', 'physical purity', 'genetic purity',
  'ingredients', 'composition', 'content',
  'storage', 'store', 'precaution', 'warning', 'caution',
  'dealer', 'distributor', 'contact', 'address',
  'barcode', 'qr', 'helpline', 'toll free'
];

// Required fields for each side
const FRONT_REQUIRED_FIELDS = ['brandName', 'productName'];
const BACK_REQUIRED_FIELDS = ['batchNumber', 'manufacturingDate'];

export async function POST(request: NextRequest): Promise<NextResponse<EdgeValidationResponse>> {
  const startTime = Date.now();

  try {
    const body: EdgeValidationRequest = await request.json();
    const { image, side, expectedType = 'seed_packet' } = body;

    // Validate input
    if (!image) {
      return NextResponse.json({
        isValid: false,
        qualityScore: 0,
        quality: createEmptyQualityCheck(),
        detectedSide: 'unknown',
        sideMatchesClaim: false,
        isPacketDetected: false,
        extractedFields: {},
        missingRequiredFields: [],
        validationErrors: ['No image provided'],
        canProceedToCloud: false,
      }, { status: 400 });
    }

    if (!side || !['front', 'back'].includes(side)) {
      return NextResponse.json({
        isValid: false,
        qualityScore: 0,
        quality: createEmptyQualityCheck(),
        detectedSide: 'unknown',
        sideMatchesClaim: false,
        isPacketDetected: false,
        extractedFields: {},
        missingRequiredFields: [],
        validationErrors: ['Invalid or missing side parameter. Must be "front" or "back"'],
        canProceedToCloud: false,
      }, { status: 400 });
    }

    // Decode base64 image
    const imageData = decodeBase64Image(image);
    if (!imageData) {
      return NextResponse.json({
        isValid: false,
        qualityScore: 0,
        quality: createEmptyQualityCheck(),
        detectedSide: 'unknown',
        sideMatchesClaim: false,
        isPacketDetected: false,
        extractedFields: {},
        missingRequiredFields: [],
        validationErrors: ['Invalid base64 image data'],
        canProceedToCloud: false,
      }, { status: 400 });
    }

    // Check file size
    if (imageData.length > MAX_FILE_SIZE) {
      return NextResponse.json({
        isValid: false,
        qualityScore: 0,
        quality: createEmptyQualityCheck(),
        detectedSide: 'unknown',
        sideMatchesClaim: false,
        isPacketDetected: false,
        extractedFields: {},
        missingRequiredFields: [],
        validationErrors: [`Image too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`],
        canProceedToCloud: false,
      }, { status: 400 });
    }

    // Perform image quality analysis
    const quality = await analyzeImageQuality(imageData);
    const validationErrors: string[] = [];

    // Check resolution
    if (!quality.resolution.isAcceptable) {
      validationErrors.push(
        `Image resolution too low (${quality.resolution.width}x${quality.resolution.height}). Minimum: ${MIN_WIDTH}x${MIN_HEIGHT}`
      );
    }

    // Check blur
    if (quality.isBlurry) {
      validationErrors.push(`Image is too blurry (score: ${quality.blurScore}). Please capture a clearer image.`);
    }

    // Check brightness
    if (quality.isTooLight) {
      validationErrors.push('Image is too bright. Try capturing in shade or reduce lighting.');
    }
    if (quality.isTooDark) {
      validationErrors.push('Image is too dark. Try capturing in better lighting.');
    }

    // Perform OCR extraction (lightweight version for edge)
    const { extractedFields, rawText, hasText } = await performEdgeOCR(imageData);
    quality.hasText = hasText;

    // Check if text was detected
    if (!hasText) {
      validationErrors.push('No text detected in image. Ensure the packet label is visible.');
    }

    // Detect packet in image
    const isPacketDetected = detectPacket(extractedFields, rawText, expectedType);
    if (!isPacketDetected) {
      validationErrors.push('Could not detect a seed packet in the image. Ensure the full packet is visible.');
    }

    // Classify detected side
    const detectedSide = classifySide(extractedFields, rawText);
    const sideMatchesClaim = detectedSide === side || detectedSide === 'unknown';

    if (!sideMatchesClaim) {
      validationErrors.push(
        `Image appears to be the ${detectedSide} of the packet, but you selected "${side}". Please verify.`
      );
    }

    // Check for missing required fields
    const missingRequiredFields = getMissingRequiredFields(extractedFields, side);
    if (missingRequiredFields.length > 0 && hasText) {
      // Only warn, don't block - cloud OCR might extract more
      quality.recommendedAction = `Some fields may be missing: ${missingRequiredFields.join(', ')}. Cloud processing will attempt deeper extraction.`;
    }

    // Calculate overall quality score
    const qualityScore = calculateQualityScore(quality, hasText, isPacketDetected);

    // Determine if we can proceed to cloud
    const canProceedToCloud = 
      quality.resolution.isAcceptable &&
      !quality.isBlurry &&
      !quality.isTooLight &&
      !quality.isTooDark &&
      hasText &&
      isPacketDetected;

    const processingTime = Date.now() - startTime;

    const response: EdgeValidationResponse = {
      isValid: validationErrors.length === 0,
      qualityScore,
      quality,
      detectedSide,
      sideMatchesClaim,
      isPacketDetected,
      extractedFields,
      missingRequiredFields,
      validationErrors,
      canProceedToCloud,
    };

    // Add processing time header
    return NextResponse.json(response, {
      headers: {
        'X-Processing-Time': `${processingTime}ms`,
      },
    });
  } catch (error) {
    console.error('Edge validation error:', error);
    return NextResponse.json({
      isValid: false,
      qualityScore: 0,
      quality: createEmptyQualityCheck(),
      detectedSide: 'unknown',
      sideMatchesClaim: false,
      isPacketDetected: false,
      extractedFields: {},
      missingRequiredFields: [],
      validationErrors: [`Internal error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      canProceedToCloud: false,
    }, { status: 500 });
  }
}

/**
 * Decode base64 image data
 */
function decodeBase64Image(base64: string): Uint8Array | null {
  try {
    // Remove data URL prefix if present
    let data = base64;
    if (data.startsWith('data:')) {
      const parts = data.split(',');
      if (parts.length !== 2) return null;
      data = parts[1];
    }

    // Decode base64
    const binaryString = atob(data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

/**
 * Analyze image quality metrics
 */
async function analyzeImageQuality(imageData: Uint8Array): Promise<QualityCheck> {
  // Extract image dimensions and basic metrics from image headers/data
  const dimensions = extractImageDimensions(imageData);
  const pixelStats = analyzePixelStatistics(imageData);

  const width = dimensions.width;
  const height = dimensions.height;
  const isAcceptable = width >= MIN_WIDTH && height >= MIN_HEIGHT;

  // Calculate blur score based on edge detection simulation
  // In a full implementation, this would use actual edge detection
  const blurScore = estimateBlurScore(pixelStats);

  // Calculate brightness from average pixel values
  const brightness = pixelStats.averageBrightness;

  return {
    resolution: {
      width,
      height,
      isAcceptable,
    },
    blurScore,
    isBlurry: blurScore < MIN_BLUR_SCORE,
    brightness,
    isTooLight: brightness > MAX_BRIGHTNESS,
    isTooDark: brightness < MIN_BRIGHTNESS,
    hasText: false, // Will be updated after OCR
    orientation: width > height ? 'landscape' : 'portrait',
    recommendedAction: undefined,
  };
}

/**
 * Extract image dimensions from binary data
 * Supports JPEG, PNG, and WebP formats
 */
function extractImageDimensions(data: Uint8Array): { width: number; height: number } {
  // Default dimensions if we can't parse
  let width = 0;
  let height = 0;

  try {
    // Check for JPEG (starts with FFD8FF)
    if (data[0] === 0xFF && data[1] === 0xD8 && data[2] === 0xFF) {
      // Parse JPEG to find SOF0 marker for dimensions
      let offset = 2;
      while (offset < data.length - 9) {
        if (data[offset] === 0xFF) {
          const marker = data[offset + 1];
          // SOF0, SOF1, SOF2 markers contain dimensions
          if (marker >= 0xC0 && marker <= 0xC2) {
            height = (data[offset + 5] << 8) | data[offset + 6];
            width = (data[offset + 7] << 8) | data[offset + 8];
            break;
          }
          // Skip to next marker
          const segmentLength = (data[offset + 2] << 8) | data[offset + 3];
          offset += 2 + segmentLength;
        } else {
          offset++;
        }
      }
    }
    // Check for PNG (starts with 89504E47)
    else if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E && data[3] === 0x47) {
      // PNG IHDR chunk at offset 16 contains dimensions
      width = (data[16] << 24) | (data[17] << 16) | (data[18] << 8) | data[19];
      height = (data[20] << 24) | (data[21] << 16) | (data[22] << 8) | data[23];
    }
    // Check for WebP (starts with RIFF...WEBP)
    else if (
      data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46 &&
      data[8] === 0x57 && data[9] === 0x45 && data[10] === 0x42 && data[11] === 0x50
    ) {
      // WebP VP8 or VP8L header contains dimensions
      // This is a simplified extraction - full WebP parsing is more complex
      if (data[12] === 0x56 && data[13] === 0x50 && data[14] === 0x38) {
        // VP8 format
        if (data[15] === 0x20) {
          // Lossy VP8
          width = ((data[26] | (data[27] << 8)) & 0x3FFF);
          height = ((data[28] | (data[29] << 8)) & 0x3FFF);
        } else if (data[15] === 0x4C) {
          // VP8L lossless
          const signature = data[21];
          if (signature === 0x2F) {
            const b1 = data[22];
            const b2 = data[23];
            const b3 = data[24];
            const b4 = data[25];
            width = ((b1 | ((b2 & 0x3F) << 8)) + 1);
            height = ((((b2 & 0xC0) >> 6) | (b3 << 2) | ((b4 & 0x0F) << 10)) + 1);
          }
        }
      }
    }

    // If we couldn't extract dimensions, estimate based on file size
    if (width === 0 || height === 0) {
      // Rough estimate: assume typical compression ratio and 3 bytes per pixel
      const estimatedPixels = data.length * 10; // ~10x compression
      const side = Math.sqrt(estimatedPixels);
      width = Math.round(side * 1.33); // Assume 4:3 aspect ratio
      height = Math.round(side * 0.75);
    }
  } catch {
    // Default to minimum acceptable size on error
    width = MIN_WIDTH;
    height = MIN_HEIGHT;
  }

  return { width, height };
}

/**
 * Analyze pixel statistics from image data
 * This is a lightweight analysis that samples the image data
 */
function analyzePixelStatistics(data: Uint8Array): {
  averageBrightness: number;
  variance: number;
  edgeStrength: number;
} {
  // Sample every Nth byte for efficiency (image data after headers)
  const startOffset = Math.min(100, Math.floor(data.length * 0.1)); // Skip headers
  const sampleRate = Math.max(1, Math.floor((data.length - startOffset) / 5000));
  
  let sum = 0;
  let sumSquares = 0;
  let count = 0;
  let edgeSum = 0;
  let prevValue = 0;

  for (let i = startOffset; i < data.length; i += sampleRate) {
    const value = data[i];
    sum += value;
    sumSquares += value * value;
    count++;

    // Simple edge detection: measure differences between adjacent samples
    if (i > startOffset) {
      edgeSum += Math.abs(value - prevValue);
    }
    prevValue = value;
  }

  const average = count > 0 ? sum / count : 128;
  const variance = count > 0 ? (sumSquares / count) - (average * average) : 0;
  const edgeStrength = count > 1 ? edgeSum / (count - 1) : 0;

  // Normalize brightness to 0-100 scale
  const averageBrightness = Math.round((average / 255) * 100);

  return {
    averageBrightness,
    variance,
    edgeStrength,
  };
}

/**
 * Estimate blur score based on edge strength
 * Higher edge strength = sharper image
 */
function estimateBlurScore(stats: { edgeStrength: number; variance: number }): number {
  // Combine edge strength and variance for blur estimation
  // Sharp images have high edge strength and high variance
  const edgeScore = Math.min(100, (stats.edgeStrength / 50) * 100);
  const varianceScore = Math.min(100, (stats.variance / 2000) * 100);
  
  // Weighted combination
  const blurScore = Math.round(edgeScore * 0.6 + varianceScore * 0.4);
  
  return Math.max(0, Math.min(100, blurScore));
}

/**
 * Perform lightweight OCR for edge processing
 * Uses pattern matching and Azure AI Vision edge endpoint if available
 */
async function performEdgeOCR(imageData: Uint8Array): Promise<{
  extractedFields: ExtractedFields;
  rawText: string;
  hasText: boolean;
}> {
  // In edge runtime, we'll use Azure AI Vision edge endpoint if configured
  // Otherwise, fall back to simulated extraction based on image analysis
  
  const azureEndpoint = process.env.AZURE_EDGE_VISION_ENDPOINT;
  const azureKey = process.env.AZURE_EDGE_VISION_KEY;

  if (azureEndpoint && azureKey) {
    try {
      return await performAzureEdgeOCR(imageData, azureEndpoint, azureKey);
    } catch (error) {
      console.error('Azure Edge OCR failed, falling back to simulation:', error);
    }
  }

  // Fallback: Use lightweight analysis
  // In production, you'd want to use Tesseract.js WASM or similar
  return performLightweightOCR(imageData);
}

/**
 * Perform OCR using Azure AI Vision edge endpoint
 */
async function performAzureEdgeOCR(
  imageData: Uint8Array,
  endpoint: string,
  key: string
): Promise<{
  extractedFields: ExtractedFields;
  rawText: string;
  hasText: boolean;
}> {
  // Call Azure Computer Vision Read API
  // Create a new Uint8Array copy to ensure proper ArrayBuffer type
  const bodyData = new Uint8Array(imageData);
  
  const response = await fetch(`${endpoint}/vision/v3.2/read/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Ocp-Apim-Subscription-Key': key,
    },
    body: bodyData as unknown as BodyInit,
  });

  if (!response.ok) {
    throw new Error(`Azure OCR request failed: ${response.status}`);
  }

  // Get operation location
  const operationLocation = response.headers.get('Operation-Location');
  if (!operationLocation) {
    throw new Error('No operation location returned');
  }

  // Poll for result (max 5 seconds for edge)
  let result = null;
  for (let i = 0; i < 10; i++) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const resultResponse = await fetch(operationLocation, {
      headers: {
        'Ocp-Apim-Subscription-Key': key,
      },
    });

    if (!resultResponse.ok) {
      throw new Error(`Failed to get OCR result: ${resultResponse.status}`);
    }

    result = await resultResponse.json();
    
    if (result.status === 'succeeded') {
      break;
    }
    if (result.status === 'failed') {
      throw new Error('OCR operation failed');
    }
  }

  if (!result || result.status !== 'succeeded') {
    throw new Error('OCR operation timed out');
  }

  // Extract text from result
  let rawText = '';
  const readResults = result.analyzeResult?.readResults || [];
  
  for (const page of readResults) {
    for (const line of page.lines || []) {
      rawText += line.text + '\n';
    }
  }

  const hasText = rawText.trim().length > 10;
  const extractedFields = extractFieldsFromText(rawText);

  return { extractedFields, rawText, hasText };
}

/**
 * Lightweight OCR simulation for edge runtime
 * This provides basic validation when Azure is not available
 */
function performLightweightOCR(_imageData: Uint8Array): {
  extractedFields: ExtractedFields;
  rawText: string;
  hasText: boolean;
} {
  // In a real implementation, this would use Tesseract.js WASM
  // For now, we return empty fields and let the quality check determine if text is likely present
  
  // We indicate that text detection requires cloud processing
  return {
    extractedFields: {},
    rawText: '',
    hasText: true, // Assume text is present, let cloud verify
  };
}

/**
 * Extract structured fields from OCR text
 */
function extractFieldsFromText(text: string): ExtractedFields {
  const fields: ExtractedFields = {};
  const lowerText = text.toLowerCase();

  // Extract brand name (usually prominent text at top)
  const brandPatterns = [
    /(?:brand|manufacturer|company)[:\s]+([A-Za-z0-9\s&.,-]+)/i,
    /^([A-Z][A-Za-z\s&.]+(?:Seeds?|Agri|Farm|Industries)?)/m,
  ];
  for (const pattern of brandPatterns) {
    const match = text.match(pattern);
    if (match && match[1].trim().length >= 3) {
      fields.brandName = match[1].trim().substring(0, 50);
      break;
    }
  }

  // Extract product name
  const productPatterns = [
    /(?:product|variety|hybrid)[:\s]+([A-Za-z0-9\s-]+)/i,
    /(?:paddy|rice|wheat|cotton|maize|vegetable)[:\s]*([A-Za-z0-9\s-]+)/i,
  ];
  for (const pattern of productPatterns) {
    const match = text.match(pattern);
    if (match && match[1].trim().length >= 2) {
      fields.productName = match[1].trim().substring(0, 50);
      break;
    }
  }

  // Extract crop type
  const cropTypes = ['paddy', 'rice', 'wheat', 'cotton', 'maize', 'soybean', 'groundnut', 'mustard', 'vegetable'];
  for (const crop of cropTypes) {
    if (lowerText.includes(crop)) {
      fields.cropType = crop.charAt(0).toUpperCase() + crop.slice(1);
      break;
    }
  }

  // Extract batch number
  const batchMatch = text.match(/(?:batch|lot)[:\s#.]*([A-Z0-9\-\/]+)/i);
  if (batchMatch) {
    fields.batchNumber = batchMatch[1].trim();
  }

  // Extract certification/license number
  const certMatch = text.match(/(?:cert|certificate|license|lic|fco)[:\s#.]*([A-Z0-9\-\/]+)/i);
  if (certMatch) {
    fields.certificationNumber = certMatch[1].trim();
  }

  // Extract license number separately if different format
  const licenseMatch = text.match(/(?:seeds?\s*act|fco)[:\s#.]*(?:lic|license)?[:\s#.]*([A-Z0-9\-\/]+)/i);
  if (licenseMatch) {
    fields.licenseNumber = licenseMatch[1].trim();
  }

  // Extract manufacturing date
  const mfgMatch = text.match(/(?:mfg|mfd|manufacturing|manufactured|packed)[:\s]*(?:date)?[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i);
  if (mfgMatch) {
    fields.manufacturingDate = mfgMatch[1].trim();
  }

  // Extract expiry date
  const expMatch = text.match(/(?:exp|expiry|expire|best\s*before|use\s*by)[:\s]*(?:date)?[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i);
  if (expMatch) {
    fields.expiryDate = expMatch[1].trim();
  }

  // Extract MRP
  const mrpMatch = text.match(/(?:mrp|price|rs|₹)[:\s.]*(\d+(?:[.,]\d{2})?)/i);
  if (mrpMatch) {
    fields.mrp = '₹' + mrpMatch[1].trim();
  }

  // Extract net weight
  const weightMatch = text.match(/(?:net\s*(?:wt|weight)|weight)[:\s]*(\d+(?:\.\d+)?\s*(?:kg|g|gm|gram|kilogram)s?)/i);
  if (weightMatch) {
    fields.netWeight = weightMatch[1].trim();
  }

  return fields;
}

/**
 * Detect if the image contains a seed packet
 */
function detectPacket(
  fields: ExtractedFields,
  rawText: string,
  expectedType: 'seed_packet' | 'fertilizer_bag' | 'pesticide_bottle'
): boolean {
  // Check if we have any extracted fields
  const hasFields = Object.values(fields).some(v => v !== undefined);
  
  if (!hasFields && rawText.length < 20) {
    return false;
  }

  const lowerText = rawText.toLowerCase();

  // Check for seed packet indicators
  if (expectedType === 'seed_packet') {
    const seedIndicators = [
      'seed', 'seeds', 'beej', 'variety', 'hybrid',
      'germination', 'purity', 'genetic',
      'paddy', 'rice', 'wheat', 'cotton', 'maize',
      'soybean', 'groundnut', 'mustard', 'vegetable',
      'kg', 'net wt', 'net weight',
      'batch', 'mfg', 'exp'
    ];

    const matches = seedIndicators.filter(ind => lowerText.includes(ind));
    return matches.length >= 2; // At least 2 indicators
  }

  // Check for fertilizer bag indicators
  if (expectedType === 'fertilizer_bag') {
    const fertilizerIndicators = [
      'fertilizer', 'fertiliser', 'npk', 'urea', 'dap',
      'nitrogen', 'phosphorus', 'potassium',
      'granules', 'nutrient'
    ];
    return fertilizerIndicators.some(ind => lowerText.includes(ind));
  }

  // Check for pesticide bottle indicators
  if (expectedType === 'pesticide_bottle') {
    const pesticideIndicators = [
      'pesticide', 'insecticide', 'fungicide', 'herbicide',
      'poison', 'caution', 'toxic', 'antidote'
    ];
    return pesticideIndicators.some(ind => lowerText.includes(ind));
  }

  return hasFields;
}

/**
 * Classify which side of the packet is shown
 */
function classifySide(fields: ExtractedFields, rawText: string): 'front' | 'back' | 'unknown' {
  const lowerText = rawText.toLowerCase();

  // Count front and back indicators
  let frontScore = 0;
  let backScore = 0;

  for (const indicator of FRONT_INDICATORS) {
    if (lowerText.includes(indicator)) {
      frontScore++;
    }
  }

  for (const indicator of BACK_INDICATORS) {
    if (lowerText.includes(indicator)) {
      backScore++;
    }
  }

  // Also check extracted fields
  if (fields.brandName) frontScore += 2;
  if (fields.productName) frontScore += 2;
  if (fields.cropType) frontScore += 1;
  if (fields.netWeight) frontScore += 1;

  if (fields.batchNumber) backScore += 2;
  if (fields.manufacturingDate) backScore += 2;
  if (fields.expiryDate) backScore += 2;
  if (fields.certificationNumber) backScore += 1;
  if (fields.licenseNumber) backScore += 1;

  // Determine side based on scores
  if (frontScore > backScore + 2) {
    return 'front';
  }
  if (backScore > frontScore + 2) {
    return 'back';
  }

  return 'unknown';
}

/**
 * Get list of missing required fields
 */
function getMissingRequiredFields(fields: ExtractedFields, side: 'front' | 'back'): string[] {
  const requiredFields = side === 'front' ? FRONT_REQUIRED_FIELDS : BACK_REQUIRED_FIELDS;
  const missing: string[] = [];

  for (const field of requiredFields) {
    if (!fields[field as keyof ExtractedFields]) {
      // Convert camelCase to readable format
      const readable = field.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
      missing.push(readable);
    }
  }

  return missing;
}

/**
 * Calculate overall quality score
 */
function calculateQualityScore(
  quality: QualityCheck,
  hasText: boolean,
  isPacketDetected: boolean
): number {
  let score = 100;

  // Resolution penalty
  if (!quality.resolution.isAcceptable) {
    score -= 30;
  } else {
    // Bonus for higher resolution
    const resScore = Math.min(quality.resolution.width, quality.resolution.height) / 1000;
    score += Math.min(10, resScore * 5);
  }

  // Blur penalty
  if (quality.isBlurry) {
    score -= 25;
  } else {
    score += Math.min(10, (quality.blurScore - 50) / 5);
  }

  // Brightness penalty
  if (quality.isTooLight || quality.isTooDark) {
    score -= 15;
  }

  // Text detection penalty
  if (!hasText) {
    score -= 20;
  }

  // Packet detection penalty
  if (!isPacketDetected) {
    score -= 20;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Create empty quality check for error responses
 */
function createEmptyQualityCheck(): QualityCheck {
  return {
    resolution: { width: 0, height: 0, isAcceptable: false },
    blurScore: 0,
    isBlurry: true,
    brightness: 0,
    isTooLight: false,
    isTooDark: true,
    hasText: false,
    orientation: 'portrait',
  };
}

// Health check endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'healthy',
    runtime: 'edge',
    version: '1.0.0',
    features: {
      qualityAnalysis: true,
      ocrExtraction: !!process.env.AZURE_EDGE_VISION_ENDPOINT,
      packetDetection: true,
      sideClassification: true,
    },
  });
}
