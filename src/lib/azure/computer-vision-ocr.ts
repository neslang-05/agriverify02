import { ComputerVisionClient } from '@azure/cognitiveservices-computervision';
import { ApiKeyCredentials } from '@azure/ms-rest-js';

export interface OCRResult {
  detectedText: string;
  brandName?: string;
  batchNumber?: string;
  certificationNumber?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  confidence: number;
  lines: OCRLine[];
  suspiciousFlags: string[];
}

export interface OCRLine {
  text: string;
  confidence: number;
  boundingBox: number[];
}

class ComputerVisionOCRService {
  private endpoint: string;
  private key: string;
  private client: ComputerVisionClient | null = null;

  constructor() {
    this.endpoint = process.env.AZURE_COMPUTER_VISION_ENDPOINT || '';
    this.key = process.env.AZURE_COMPUTER_VISION_KEY || '';
  }

  private getClient(): ComputerVisionClient {
    if (!this.client) {
      if (!this.endpoint || !this.key) {
        throw new Error('Azure Computer Vision credentials not configured');
      }
      const credentials = new ApiKeyCredentials({ 
        inHeader: { 'Ocp-Apim-Subscription-Key': this.key }
      });
      this.client = new ComputerVisionClient(credentials, this.endpoint);
    }
    return this.client;
  }

  /**
   * Extract text from seed packet image using OCR
   */
  async extractText(imageBuffer: Buffer): Promise<OCRResult> {
    try {
      const client = this.getClient();
      
      // Use Read API for better accuracy
      // The SDK expects a function that returns a readable stream
      const readOperation = await client.readInStream(() => {
        const { Readable } = require('stream');
        return Readable.from(imageBuffer);
      });
      
      // Get the operation location (URL with operation ID)
      const operationLocation = readOperation.operationLocation;
      
      if (!operationLocation) {
        throw new Error('No operation location returned from OCR');
      }
      
      const operationId = operationLocation.split('/').slice(-1)[0];

      // Wait for the read operation to complete
      let result = await client.getReadResult(operationId);
      
      // Poll until the operation completes
      let attempts = 0;
      while (result.status === 'running' || result.status === 'notStarted') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        result = await client.getReadResult(operationId);
        attempts++;
        
        if (attempts > 10) {
          throw new Error('OCR operation timed out');
        }
      }

      if (result.status !== 'succeeded') {
        throw new Error('OCR operation failed');
      }

      // Extract all text lines
      const lines: OCRLine[] = [];
      let allText = '';
      let totalConfidence = 0;
      let lineCount = 0;

      if (result.analyzeResult && result.analyzeResult.readResults) {
        for (const page of result.analyzeResult.readResults) {
          for (const line of page.lines) {
            allText += line.text + '\n';
            
            // Calculate confidence from words
            const wordConfidences = line.words?.map(w => w.confidence || 0.9) || [0.9];
            const lineConfidence = wordConfidences.reduce((a, b) => a + b, 0) / wordConfidences.length;
            
            lines.push({
              text: line.text,
              confidence: lineConfidence,
              boundingBox: line.boundingBox || []
            });
            
            totalConfidence += lineConfidence;
            lineCount++;
          }
        }
      }

      const avgConfidence = lineCount > 0 ? totalConfidence / lineCount : 0;

      // Extract structured data
      const extractedData = this.extractStructuredData(allText);
      const suspiciousFlags = this.detectSuspiciousPatterns(allText, extractedData);

      return {
        detectedText: allText.trim(),
        ...extractedData,
        confidence: avgConfidence,
        lines,
        suspiciousFlags
      };
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error(`Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract structured information from OCR text
   */
  private extractStructuredData(text: string): {
    brandName?: string;
    batchNumber?: string;
    certificationNumber?: string;
    manufacturingDate?: string;
    expiryDate?: string;
  } {
    const data: any = {};

    // Extract brand name (usually first few lines or marked as Brand/Manufacturer)
    const brandMatch = text.match(/(?:Brand|Manufacturer|Company)[:\s]+([A-Za-z0-9\s&.,-]+)/i);
    if (brandMatch) {
      data.brandName = brandMatch[1].trim();
    } else {
      // Try to get first capitalized line as brand
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.match(/^[A-Z][A-Za-z\s&.]+$/) && line.length > 3 && line.length < 50) {
          data.brandName = line.trim();
          break;
        }
      }
    }

    // Extract batch number
    const batchMatch = text.match(/(?:Batch|Lot|Batch No|Lot No)[:\s#.]*([A-Z0-9\-\/]+)/i);
    if (batchMatch) {
      data.batchNumber = batchMatch[1].trim();
    }

    // Extract certification number (FCO, Seeds Act, etc.)
    const certMatch = text.match(/(?:Cert|Certificate|License|FCO|Lic)[:\s#.]*([A-Z0-9\-\/]+)/i);
    if (certMatch) {
      data.certificationNumber = certMatch[1].trim();
    }

    // Extract manufacturing date
    const mfgMatch = text.match(/(?:Mfg|Manufacturing|Manufactured|Packed)[:\s]*(?:Date)?[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i);
    if (mfgMatch) {
      data.manufacturingDate = mfgMatch[1].trim();
    }

    // Extract expiry date
    const expMatch = text.match(/(?:Exp|Expiry|Expire|Best Before|Use By)[:\s]*(?:Date)?[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i);
    if (expMatch) {
      data.expiryDate = expMatch[1].trim();
    }

    return data;
  }

  /**
   * Detect suspicious patterns in packaging
   */
  private detectSuspiciousPatterns(text: string, extractedData: any): string[] {
    const flags: string[] = [];

    // Check for missing mandatory fields
    if (!extractedData.certificationNumber) {
      flags.push('Missing certification number');
    }

    if (!extractedData.batchNumber) {
      flags.push('Missing batch number');
    }

    if (!extractedData.manufacturingDate) {
      flags.push('Missing manufacturing date');
    }

    // Check for poor text quality (too many special characters)
    const specialCharRatio = (text.match(/[^a-zA-Z0-9\s]/g) || []).length / text.length;
    if (specialCharRatio > 0.3 && text.length > 20) {
      flags.push('Poor label quality or unreadable text');
    }

    // Check for suspicious keywords
    const suspiciousKeywords = ['copy', 'duplicate', 'replica', 'imitation'];
    for (const keyword of suspiciousKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        flags.push(`Suspicious keyword detected: "${keyword}"`);
      }
    }

    // Check for too short text (likely incomplete label)
    if (text.length < 50) {
      flags.push('Insufficient text on label');
    }

    // Check for expired product
    if (extractedData.expiryDate) {
      try {
        const expiryDate = this.parseDate(extractedData.expiryDate);
        if (expiryDate && expiryDate < new Date()) {
          flags.push('Product has expired');
        }
      } catch (e) {
        // Ignore date parsing errors
      }
    }

    return flags;
  }

  /**
   * Parse date from various formats
   */
  private parseDate(dateStr: string): Date | null {
    try {
      // Try different date formats
      const formats = [
        /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/,  // DD-MM-YYYY or MM-DD-YYYY
        /(\d{1,2})[-\/](\d{1,2})[-\/](\d{2})/,  // DD-MM-YY
      ];

      for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
          const [, p1, p2, p3] = match;
          const year = p3.length === 2 ? 2000 + parseInt(p3) : parseInt(p3);
          // Assume DD-MM-YYYY format (common in India)
          return new Date(year, parseInt(p2) - 1, parseInt(p1));
        }
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  /**
   * Validate brand name against known brands
   */
  isKnownBrand(brandName: string): boolean {
    const knownBrands = [
      'Nuziveedu Seeds',
      'Kaveri Seeds',
      'Mahyco',
      'Syngenta',
      'Bayer',
      'Pioneer',
      'Monsanto',
      'JK Agri Genetics',
      'Rasi Seeds',
      'Bio Seeds',
      'Crystal',
      'PHI Seeds'
    ];

    const normalizedBrand = brandName.toLowerCase().trim();
    return knownBrands.some(known => 
      normalizedBrand.includes(known.toLowerCase()) || 
      known.toLowerCase().includes(normalizedBrand)
    );
  }
}

// Private singleton instance (not exported to avoid 'use server' issues)
const computerVisionOCRService = new ComputerVisionOCRService();

// Main export function
export async function performOCR(imageBuffer: Buffer): Promise<OCRResult> {
  return await computerVisionOCRService.extractText(imageBuffer);
}

// Export brand validation as async function for use in server actions
export async function isKnownBrand(brandName: string): Promise<boolean> {
  return computerVisionOCRService.isKnownBrand(brandName);
}
