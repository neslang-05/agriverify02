// Edge Validation Types

export interface EdgeValidationRequest {
  image: string; // Base64 encoded image
  side: 'front' | 'back';
  expectedType?: 'seed_packet' | 'fertilizer_bag' | 'pesticide_bottle';
}

export interface QualityCheck {
  resolution: {
    width: number;
    height: number;
    isAcceptable: boolean;
  };
  blurScore: number; // 0-100, higher = sharper
  isBlurry: boolean;
  brightness: number; // 0-100
  isTooLight: boolean;
  isTooDark: boolean;
  hasText: boolean;
  orientation: 'portrait' | 'landscape';
  recommendedAction?: string;
}

export interface ExtractedFields {
  brandName?: string;
  productName?: string;
  cropType?: string;
  batchNumber?: string;
  certificationNumber?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  mrp?: string;
  licenseNumber?: string;
  netWeight?: string;
}

export interface EdgeValidationResponse {
  isValid: boolean;
  qualityScore: number; // 0-100
  quality: QualityCheck;
  detectedSide: 'front' | 'back' | 'unknown';
  sideMatchesClaim: boolean;
  isPacketDetected: boolean;
  extractedFields: ExtractedFields;
  missingRequiredFields: string[];
  validationErrors: string[];
  canProceedToCloud: boolean;
}

// Cloud Processing Types

export interface PacketClassificationResult {
  predictedClass: string;
  isGenuine: boolean;
  isFake: boolean;
  confidence: number;
  allPredictions: Array<{
    tagName: string;
    probability: number;
  }>;
  cropType: string;
  productType: 'seed_packet' | 'fertilizer_bag' | 'pesticide_bottle' | 'unknown';
}

export interface DeepOCRResult {
  fullText: string;
  structuredData: {
    brandName?: string;
    productName?: string;
    cropType?: string;
    variety?: string;
    batchNumber?: string;
    lotNumber?: string;
    certificationNumber?: string;
    fcoLicense?: string;
    seedActLicense?: string;
    manufacturingDate?: string;
    packingDate?: string;
    expiryDate?: string;
    testDate?: string;
    mrp?: string;
    netWeight?: string;
    germinationPercentage?: string;
    purityPercentage?: string;
    manufacturerName?: string;
    manufacturerAddress?: string;
    dealerLicense?: string;
    barcodeData?: string;
    qrCodeData?: string;
  };
  confidence: number;
  lineByLineResults: Array<{
    text: string;
    confidence: number;
    boundingBox: number[];
  }>;
}

// Combined Verification Types

export interface DualImageVerificationRequest {
  frontImage: string; // Base64
  backImage: string; // Base64
  cropType?: string;
  district?: string;
}

export interface PacketVerificationResult {
  id: string;
  frontAnalysis: {
    classification: PacketClassificationResult;
    ocr: DeepOCRResult;
    qualityScore: number;
  };
  backAnalysis: {
    classification: PacketClassificationResult;
    ocr: DeepOCRResult;
    qualityScore: number;
  };
  combinedVerdict: 'genuine' | 'suspicious' | 'fake';
  combinedConfidence: number;
  extractedData: DeepOCRResult['structuredData'];
  crossReferenceScore: number;
  riskFactors: string[];
  recommendations: string[];
  verifiedAt: string;
}

// Cross-Reference Types

export interface GenuineProduct {
  id: string;
  brand_name: string;
  product_name: string;
  crop_type: string;
  manufacturer_name?: string;
  manufacturer_license?: string;
  certification_pattern?: string;
  batch_pattern?: string;
  active_from?: string;
  active_until?: string;
  is_active: boolean;
}

export interface FakePattern {
  id: string;
  brand_name?: string;
  fake_indicators: string[];
  region?: string;
  seizure_date?: string;
  case_number?: string;
}

export interface CrossReferenceResult {
  matchedGenuineProduct: GenuineProduct | null;
  matchedFakePattern: FakePattern | null;
  validationChecks: {
    brandExists: boolean;
    batchFormatValid: boolean;
    certificationFormatValid: boolean;
    dateRangeValid: boolean;
    manufacturerLicenseValid: boolean;
    notExpired: boolean;
    notReportedFake: boolean;
  };
  score: number; // 0-100
  flags: string[];
}
