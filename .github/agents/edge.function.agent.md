# Agent Instructions: Seed Packet Authenticity Verification System

## Project Overview

Build a comprehensive seed packet authenticity verification system that validates seed packets (not seed grains) through a multi-step process involving edge processing, image quality validation, OCR extraction, and cloud-based classification.

## Current State Analysis

### Existing Implementation (Problems)
- Custom Vision model trained on **paddy seed grains** (Pure vs Bad) - WRONG
- Single image upload - INSUFFICIENT
- No image quality validation - RISKY
- All processing in cloud - WASTEFUL
- OCR runs after classification - INEFFICIENT
- Only supports paddy seeds - LIMITED

### Target Implementation
- Custom Vision model trained on **seed packets** (Genuine vs Fake)
- Dual image upload (front + back of packet)
- Edge-based image quality validation
- Edge-based OCR for pre-validation
- Cloud processing only for validated images
- Multi-crop support (paddy, wheat, vegetables, etc.)

---

## Architecture Specification

### Layer 1: Client-Side (React/Next.js)

#### Components to Create

1. **`src/components/farmer/dual-image-uploader.tsx`**
   - Two upload zones: "Front of Packet" and "Back of Packet"
   - Real-time preview for both images
   - Visual indicators for upload status (pending, validating, valid, invalid)
   - Camera capture option for mobile devices
   - Image cropping/rotation tools
   - Drag-and-drop support
   - File size and format validation (max 10MB, JPEG/PNG/WebP)

2. **`src/components/farmer/image-validation-feedback.tsx`**
   - Display real-time validation results from edge function
   - Show detected fields (brand, batch, certification)
   - Highlight missing required fields
   - Quality score indicator (blur, resolution, lighting)
   - Guidance prompts ("Image too blurry", "Rotate image", "Crop to packet only")

3. **`src/components/farmer/packet-verification-wizard.tsx`**
   - Step 1: Upload Front Image → Validate → Show Feedback
   - Step 2: Upload Back Image → Validate → Show Feedback
   - Step 3: Review Extracted Data → Confirm/Edit
   - Step 4: Submit for Cloud Verification
   - Step 5: Display Results

4. **`src/components/farmer/verification-result-v2.tsx`**
   - Enhanced result display showing:
     - Overall authenticity verdict (Genuine/Suspicious/Fake)
     - Front image analysis breakdown
     - Back image analysis breakdown
     - OCR extracted data with confidence scores
     - Cross-reference validation results
     - Risk factors identified
     - Recommendations

#### State Management
- Use React state for multi-step wizard
- Track validation status for each image independently
- Store OCR results from edge for display and cloud submission

---

### Layer 2: Edge Function (Vercel Edge Runtime)

#### File: `src/app/api/edge/validate-image/route.ts`

**Runtime**: Vercel Edge Runtime (`export const runtime = 'edge'`)

**Purpose**: Fast, low-latency image validation before cloud processing

**Input**:
```typescript
interface EdgeValidationRequest {
  image: string; // Base64 encoded image
  side: 'front' | 'back';
  expectedType?: 'seed_packet' | 'fertilizer_bag' | 'pesticide_bottle';
}
```

**Processing Steps**:

1. **Image Quality Analysis**
   ```typescript
   interface QualityCheck {
     resolution: { width: number; height: number; isAcceptable: boolean };
     blurScore: number; // 0-100, higher = sharper
     isBlurry: boolean;
     brightness: number; // 0-100
     isTooLight: boolean;
     isTooDark: boolean;
     hasText: boolean;
     orientation: 'portrait' | 'landscape';
     recommendedAction?: string;
   }
   ```

2. **Quick OCR (Edge-optimized)**
   - Use lightweight OCR (Tesseract.js WASM or Azure AI Vision edge endpoint)
   - Extract key fields only (not full text):
     - For FRONT: Brand name, Product name, Crop type, Net weight
     - For BACK: Batch number, Mfg date, Expiry date, License/Certification number, MRP
   
3. **Packet Detection**
   - Validate the image contains a seed packet (not random image)
   - Detect packet boundaries
   - Check if packet is fully visible (not cropped)

4. **Side Classification**
   - Determine if uploaded image matches claimed side (front/back)
   - Front typically has: Brand logo, product image, product name
   - Back typically has: Ingredients, batch info, certification marks, barcode

**Output**:
```typescript
interface EdgeValidationResponse {
  isValid: boolean;
  qualityScore: number; // 0-100
  quality: QualityCheck;
  detectedSide: 'front' | 'back' | 'unknown';
  sideMatchesClaim: boolean;
  isPacketDetected: boolean;
  extractedFields: {
    brandName?: string;
    productName?: string;
    cropType?: string;
    batchNumber?: string;
    certificationNumber?: string;
    manufacturingDate?: string;
    expiryDate?: string;
    mrp?: string;
    licenseNumber?: string;
  };
  missingRequiredFields: string[];
  validationErrors: string[];
  canProceedToCloud: boolean;
}
```

**Rejection Criteria** (return `canProceedToCloud: false`):
- Image resolution < 640x480
- Blur score < 30
- No text detected
- Packet not detected in image
- Critical fields missing (no batch number on back, no brand on front)

---

### Layer 3: Cloud Processing (Azure Custom Vision + OCR)

#### File: `src/app/actions/packet-verification.ts`

**Purpose**: Deep analysis of validated images using Azure AI services

#### Custom Vision Model Requirements

**NEW MODEL NEEDED** - Train a new Azure Custom Vision model:

**Project Name**: `seed-packet-authenticity`

**Classification Type**: Multiclass Classification

**Tags Structure**:
```
├── genuine_paddy_packet
├── fake_paddy_packet
├── genuine_wheat_packet
├── fake_wheat_packet
├── genuine_vegetable_packet
├── fake_vegetable_packet
├── genuine_cotton_packet
├── fake_cotton_packet
├── genuine_fertilizer_bag
├── fake_fertilizer_bag
├── unknown_packet
└── not_a_packet
```

**Training Data Requirements**:
- Minimum 50 images per tag (recommended 200+)
- Include variations: lighting, angles, backgrounds, wear/tear
- For FAKE packets: collect from known counterfeit seizures, create synthetic fakes
- For GENUINE packets: collect from authorized dealers, manufacturer samples
- Include both front and back images in training

**Training Tips**:
- Use Azure Custom Vision's "Smart Labeler" for faster annotation
- Enable "Domain: General (compact)" for edge deployment option
- Train separate iterations for different quality thresholds

#### File: `src/lib/azure/packet-classifier.ts`

```typescript
interface PacketClassificationResult {
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

async function classifyPacket(
  frontImage: Buffer,
  backImage: Buffer
): Promise<{
  frontAnalysis: PacketClassificationResult;
  backAnalysis: PacketClassificationResult;
  combinedVerdict: 'genuine' | 'suspicious' | 'fake';
  combinedConfidence: number;
}>;
```

#### File: `src/lib/azure/deep-ocr.ts`

Full OCR analysis using Azure Computer Vision Read API:

```typescript
interface DeepOCRResult {
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
```

---

### Layer 4: Cross-Reference Validation

#### Database Schema: `supabase/migrations/xxx_packet_verification_tables.sql`

```sql
-- Genuine product registry (populated by agricultural department)
CREATE TABLE genuine_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  crop_type VARCHAR(100) NOT NULL,
  manufacturer_name VARCHAR(255),
  manufacturer_license VARCHAR(100),
  certification_pattern VARCHAR(255), -- Regex pattern for valid cert numbers
  batch_pattern VARCHAR(255), -- Regex pattern for valid batch numbers
  active_from DATE,
  active_until DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Known fake patterns (reported fakes)
CREATE TABLE known_fake_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name VARCHAR(255),
  fake_indicators TEXT[], -- Array of suspicious patterns
  reported_by UUID REFERENCES auth.users(id),
  verified_by UUID, -- Officer who verified
  region VARCHAR(100),
  seizure_date DATE,
  case_number VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification history (enhanced)
CREATE TABLE packet_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  
  -- Images
  front_image_url TEXT NOT NULL,
  back_image_url TEXT NOT NULL,
  
  -- Edge validation results
  front_quality_score INTEGER,
  back_quality_score INTEGER,
  edge_validation_passed BOOLEAN,
  
  -- OCR extracted data
  extracted_brand_name VARCHAR(255),
  extracted_product_name VARCHAR(255),
  extracted_crop_type VARCHAR(100),
  extracted_batch_number VARCHAR(100),
  extracted_certification VARCHAR(100),
  extracted_mfg_date DATE,
  extracted_expiry_date DATE,
  extracted_mrp DECIMAL(10,2),
  full_ocr_text TEXT,
  
  -- Classification results
  front_classification VARCHAR(100),
  front_confidence DECIMAL(5,2),
  back_classification VARCHAR(100),
  back_confidence DECIMAL(5,2),
  
  -- Final verdict
  verdict VARCHAR(20) CHECK (verdict IN ('genuine', 'suspicious', 'fake')),
  overall_confidence DECIMAL(5,2),
  risk_factors TEXT[],
  recommendations TEXT[],
  
  -- Cross-reference
  matched_genuine_product_id UUID REFERENCES genuine_products(id),
  matched_fake_pattern_id UUID REFERENCES known_fake_patterns(id),
  cross_reference_score DECIMAL(5,2),
  
  -- Metadata
  device_info JSONB,
  location_info JSONB,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Officer review (for suspicious/fake)
  officer_reviewed BOOLEAN DEFAULT false,
  officer_id UUID,
  officer_verdict VARCHAR(20),
  officer_notes TEXT,
  reviewed_at TIMESTAMPTZ
);

-- Indexes for fast lookups
CREATE INDEX idx_packet_verifications_user ON packet_verifications(user_id);
CREATE INDEX idx_packet_verifications_verdict ON packet_verifications(verdict);
CREATE INDEX idx_packet_verifications_brand ON packet_verifications(extracted_brand_name);
CREATE INDEX idx_genuine_products_brand ON genuine_products(brand_name);
CREATE INDEX idx_genuine_products_crop ON genuine_products(crop_type);
```

#### File: `src/lib/validation/cross-reference.ts`

```typescript
interface CrossReferenceResult {
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

async function crossReferencePacket(
  extractedData: DeepOCRResult['structuredData']
): Promise<CrossReferenceResult>;
```

---

### Layer 5: Officer Dashboard Enhancements

#### File: `src/app/officer/verifications/page.tsx`

New officer features:
- View all verification submissions
- Filter by verdict (genuine/suspicious/fake)
- Filter by region, date range, crop type
- Review flagged verifications
- Override AI verdict with manual review
- Add to known fake patterns database
- Generate reports

#### File: `src/app/officer/fake-registry/page.tsx`

Manage known fake products:
- Add new fake patterns from seizures
- View reported fakes by farmers
- Verify and confirm fake reports
- Export data for law enforcement

---

## Implementation Order

### Phase 1: Foundation (Days 1-3)
1. Create database migrations for new tables
2. Build `dual-image-uploader.tsx` component
3. Build `packet-verification-wizard.tsx` component
4. Create basic UI flow without edge/cloud integration

### Phase 2: Edge Processing (Days 4-6)
1. Set up Vercel Edge Function
2. Implement image quality checks
3. Integrate lightweight OCR (Tesseract.js or Azure edge)
4. Build `image-validation-feedback.tsx` component
5. Connect UI to edge function

### Phase 3: Cloud Integration (Days 7-10)
1. **IMPORTANT**: Train new Custom Vision model on seed PACKETS
2. Create `packet-classifier.ts` service
3. Enhance `deep-ocr.ts` for structured extraction
4. Build `cross-reference.ts` validation
5. Create `packet-verification.ts` server action
6. Connect edge-validated images to cloud processing

### Phase 4: Results & History (Days 11-12)
1. Build `verification-result-v2.tsx` component
2. Enhance verification history page
3. Add verification detail view

### Phase 5: Officer Features (Days 13-15)
1. Build officer verification review page
2. Build fake registry management
3. Add manual override capabilities
4. Create reporting features

### Phase 6: Testing & Polish (Days 16-18)
1. End-to-end testing
2. Performance optimization
3. Error handling improvements
4. Mobile responsiveness
5. Accessibility audit

---

## Environment Variables Required

```env
# Existing
AZURE_CUSTOM_VISION_ENDPOINT=
AZURE_CUSTOM_VISION_PREDICTION_KEY=
AZURE_COMPUTER_VISION_ENDPOINT=
AZURE_COMPUTER_VISION_KEY=

# New - Packet Classification Model
AZURE_PACKET_VISION_PROJECT_ID=
AZURE_PACKET_VISION_ITERATION_NAME=
AZURE_PACKET_VISION_PREDICTION_URL=

# Edge OCR (if using Azure for edge)
AZURE_EDGE_VISION_ENDPOINT=
AZURE_EDGE_VISION_KEY=

# Or Tesseract.js (no env needed, runs in browser/edge)
```

---

## File Structure (New/Modified)

```
src/
├── app/
│   ├── api/
│   │   └── edge/
│   │       └── validate-image/
│   │           └── route.ts          # NEW: Edge function
│   ├── actions/
│   │   ├── verification.ts           # MODIFY: Keep for backward compat
│   │   └── packet-verification.ts    # NEW: Enhanced verification
│   ├── farmer/
│   │   ├── verify/
│   │   │   └── page.tsx              # MODIFY: Use new wizard
│   │   └── verify-v2/
│   │       └── page.tsx              # NEW: Enhanced verification page
│   └── officer/
│       ├── verifications/
│       │   └── page.tsx              # NEW: Review verifications
│       └── fake-registry/
│           └── page.tsx              # NEW: Manage fake patterns
├── components/
│   └── farmer/
│       ├── dual-image-uploader.tsx       # NEW
│       ├── image-validation-feedback.tsx # NEW
│       ├── packet-verification-wizard.tsx # NEW
│       └── verification-result-v2.tsx    # NEW
├── lib/
│   ├── azure/
│   │   ├── packet-classifier.ts      # NEW
│   │   └── deep-ocr.ts               # NEW (or modify computer-vision-ocr.ts)
│   └── validation/
│       └── cross-reference.ts        # NEW
└── types/
    └── packet-verification.ts        # NEW: Type definitions

supabase/
└── migrations/
    └── xxx_packet_verification_tables.sql  # NEW
```

---

## Testing Checklist

### Unit Tests
- [ ] Image quality detection accuracy
- [ ] OCR field extraction accuracy
- [ ] Cross-reference matching logic
- [ ] Verdict determination logic

### Integration Tests
- [ ] Edge function response time < 500ms
- [ ] Cloud processing response time < 5s
- [ ] Full flow from upload to result

### E2E Tests
- [ ] Upload genuine packet → Get "Genuine" verdict
- [ ] Upload fake packet → Get "Fake" verdict
- [ ] Upload blurry image → Get rejection at edge
- [ ] Upload non-packet image → Get rejection at edge
- [ ] Officer can review and override verdict

### Performance Tests
- [ ] Edge function handles 100 concurrent requests
- [ ] Cloud function handles 50 concurrent requests
- [ ] Database queries < 100ms

---

## Success Criteria

1. **Accuracy**: 90%+ accuracy in genuine vs fake classification
2. **Speed**: Edge validation < 500ms, Full verification < 8s
3. **Rejection Rate**: 95%+ of invalid images rejected at edge
4. **User Experience**: Clear feedback at every step
5. **Scalability**: Handles 1000+ verifications/day
6. **Auditability**: Complete history with officer review capability

---

## Notes for Agent

1. **Do NOT modify the existing paddy seed quality model** - it serves a different purpose (grain quality, not packet authenticity)

2. **The new packet model must be trained separately** - provide clear instructions to user for training data collection

3. **Edge function must be lightweight** - avoid heavy dependencies, use WASM-based solutions where possible

4. **Maintain backward compatibility** - existing `/farmer/verify` should still work

5. **Progressive enhancement** - if edge fails, fall back to cloud-only processing

6. **Mobile-first** - farmers will primarily use mobile devices with cameras

7. **Offline consideration** - cache edge validation logic for poor connectivity areas (future enhancement)