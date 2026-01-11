/**
 * Edge Validation Client
 * 
 * Client-side utility for calling the edge validation API.
 * Provides type-safe interface for image validation before cloud processing.
 */

import type {
  EdgeValidationRequest,
  EdgeValidationResponse,
} from '@/types/packet-verification';

export interface EdgeValidationOptions {
  /** Side of the packet being validated */
  side: 'front' | 'back';
  /** Expected product type */
  expectedType?: 'seed_packet' | 'fertilizer_bag' | 'pesticide_bottle';
  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number;
}

export interface EdgeValidationError {
  message: string;
  code: 'NETWORK_ERROR' | 'TIMEOUT' | 'INVALID_RESPONSE' | 'VALIDATION_FAILED';
}

export type EdgeValidationResult = 
  | { success: true; data: EdgeValidationResponse }
  | { success: false; error: EdgeValidationError };

/**
 * Validate an image using the edge function
 * 
 * @param image - Base64 encoded image or File object
 * @param options - Validation options
 * @returns Validation result
 */
export async function validateImageAtEdge(
  image: string | File,
  options: EdgeValidationOptions
): Promise<EdgeValidationResult> {
  const { side, expectedType = 'seed_packet', timeout = 10000 } = options;

  try {
    // Convert File to base64 if needed
    let base64Image: string;
    if (typeof image === 'string') {
      base64Image = image;
    } else {
      base64Image = await fileToBase64(image);
    }

    // Create request body
    const requestBody: EdgeValidationRequest = {
      image: base64Image,
      side,
      expectedType,
    };

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch('/api/edge/validate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            message: errorData.validationErrors?.[0] || `Request failed with status ${response.status}`,
            code: 'VALIDATION_FAILED',
          },
        };
      }

      const data: EdgeValidationResponse = await response.json();
      return { success: true, data };

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return {
          success: false,
          error: {
            message: 'Request timed out. Please try again.',
            code: 'TIMEOUT',
          },
        };
      }
      throw fetchError;
    }

  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'NETWORK_ERROR',
      },
    };
  }
}

/**
 * Convert a File object to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as base64'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Check if an image file is valid for upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Get a user-friendly message for quality issues
 */
export function getQualityGuidance(response: EdgeValidationResponse): string[] {
  const guidance: string[] = [];

  if (!response.quality.resolution.isAcceptable) {
    guidance.push('📐 Move closer to the packet or use a higher resolution camera');
  }

  if (response.quality.isBlurry) {
    guidance.push('🔍 Hold your phone steady and ensure the camera is focused');
  }

  if (response.quality.isTooLight) {
    guidance.push('☀️ Try moving to a shaded area or reduce lighting');
  }

  if (response.quality.isTooDark) {
    guidance.push('💡 Move to a brighter area or turn on flash');
  }

  if (!response.quality.hasText) {
    guidance.push('📝 Ensure the packet label is clearly visible');
  }

  if (!response.isPacketDetected) {
    guidance.push('📦 Make sure the entire seed packet is in frame');
  }

  if (!response.sideMatchesClaim) {
    guidance.push(`🔄 This appears to be the ${response.detectedSide} of the packet`);
  }

  return guidance;
}

/**
 * Get color class based on quality score
 */
export function getQualityScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get status icon based on validation result
 */
export function getValidationStatusIcon(response: EdgeValidationResponse): {
  icon: string;
  color: string;
  label: string;
} {
  if (response.canProceedToCloud) {
    return { icon: '✅', color: 'text-green-600', label: 'Ready for verification' };
  }
  
  if (response.qualityScore >= 50) {
    return { icon: '⚠️', color: 'text-yellow-600', label: 'Some issues detected' };
  }
  
  return { icon: '❌', color: 'text-red-600', label: 'Image needs improvement' };
}

/**
 * Format extracted fields for display
 */
export function formatExtractedFields(
  fields: EdgeValidationResponse['extractedFields']
): Array<{ label: string; value: string }> {
  const formatted: Array<{ label: string; value: string }> = [];

  const fieldLabels: Record<string, string> = {
    brandName: 'Brand Name',
    productName: 'Product Name',
    cropType: 'Crop Type',
    batchNumber: 'Batch Number',
    certificationNumber: 'Certification Number',
    manufacturingDate: 'Manufacturing Date',
    expiryDate: 'Expiry Date',
    mrp: 'MRP',
    licenseNumber: 'License Number',
    netWeight: 'Net Weight',
  };

  for (const [key, label] of Object.entries(fieldLabels)) {
    const value = fields[key as keyof typeof fields];
    if (value) {
      formatted.push({ label, value });
    }
  }

  return formatted;
}
