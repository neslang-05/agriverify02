'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertTriangle, XCircle, Sparkles, AlertCircle, FileText } from 'lucide-react';
import { VerificationResult as VerificationResultType } from '@/types';

interface VerificationResultProps {
  result: VerificationResultType & {
    visionAI?: {
      tag: string;
      confidence: number;
      seedVariety?: string;
    };
    ocr?: {
      detectedText: string;
      brandName?: string;
      certificationNumber?: string;
      batchNumber?: string;
      manufacturingDate?: string;
      expiryDate?: string;
    };
    riskFactors?: string[];
  };
}

export function VerificationResult({ result }: VerificationResultProps) {
  const statusConfig = {
    genuine: {
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'Genuine Product',
      description: 'This product has passed authenticity verification'
    },
    suspicious: {
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      label: 'Suspicious - Verify Further',
      description: 'This product requires additional verification'
    },
    fake: {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Counterfeit Detected',
      description: 'This product appears to be counterfeit'
    }
  };

  const config = statusConfig[result.status];
  const StatusIcon = config.icon;
  const hasVisionAI = result.visionAI !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Main Status Card */}
      <Card className="shadow-lg border-2 overflow-hidden">
        <div className={`${config.bgColor} ${config.borderColor} border-b-2`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`${config.bgColor} p-3 rounded-lg`}>
                <StatusIcon className={`h-8 w-8 ${config.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{config.label}</h3>
                <p className="text-sm text-gray-600 mb-4">{config.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Confidence Score</span>
                    <span className={`font-bold ${config.color}`}>{result.confidence}%</span>
                  </div>
                  <Progress 
                    value={result.confidence} 
                    className={`h-3 ${config.bgColor}`}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </div>

        {/* AI Vision Analysis Section */}
        {hasVisionAI && result.visionAI && (
          <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <h4 className="font-bold text-gray-900">AI Vision Analysis</h4>
              <Badge variant="outline" className="ml-auto bg-white">
                Powered by Azure
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Classification</p>
                <p className="font-bold text-gray-900 text-lg">{result.visionAI.tag}</p>
              </div>
              
              {result.visionAI.seedVariety && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Seed Variety</p>
                  <Badge variant="default" className="font-bold text-base">
                    {result.visionAI.seedVariety}
                  </Badge>
                </div>
              )}
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">AI Confidence</p>
                <div className="flex items-baseline gap-2">
                  <p className="font-bold text-indigo-600 text-lg">
                    {result.visionAI.confidence.toFixed(1)}%
                  </p>
                  <span className="text-xs text-gray-500">accuracy</span>
                </div>
              </div>
              
              {result.ocr?.brandName && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Brand Name</p>
                  <p className="font-bold text-gray-900 text-lg">{result.ocr.brandName}</p>
                </div>
              )}

              {result.ocr?.certificationNumber && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Certification Number</p>
                  <p className="font-mono font-bold text-gray-900">{result.ocr.certificationNumber}</p>
                </div>
              )}
              
              {result.ocr?.batchNumber && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Batch Number</p>
                  <p className="font-mono font-bold text-gray-900">{result.ocr.batchNumber}</p>
                </div>
              )}
              
              {result.ocr?.manufacturingDate && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Mfg. Date</p>
                  <p className="font-bold text-gray-900">{result.ocr.manufacturingDate}</p>
                </div>
              )}
              
              {result.ocr?.expiryDate && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Expiry Date</p>
                  <p className="font-bold text-gray-900">{result.ocr.expiryDate}</p>
                </div>
              )}
            </div>
            
            {/* Full OCR Text */}
            {result.ocr?.detectedText && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-indigo-600 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  View Full OCR Text
                </summary>
                <div className="mt-3 bg-white p-4 rounded-lg border">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">{result.ocr.detectedText}</pre>
                </div>
              </details>
            )}
          </CardContent>
        )}

        {/* Risk Factors Section */}
        {result.riskFactors && result.riskFactors.length > 0 && (
          <CardContent className="p-6 bg-amber-50 border-b">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-3">Risk Factors Identified</h4>
                <ul className="space-y-2">
                  {result.riskFactors.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-600 font-bold mt-0.5">•</span>
                      <span className="text-gray-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        )}

        {/* Risk Explanation */}
        <CardContent className="p-6 border-b">
          <h4 className="font-bold text-gray-900 mb-2">Analysis Details</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{result.risk_explanation}</p>
        </CardContent>

        {/* Recommendations */}
        <CardContent className="p-6">
          <h4 className="font-bold text-gray-900 mb-3">Recommendations</h4>
          <ul className="space-y-2">
            {result.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm">
                <span className={`${config.color} font-bold mt-0.5`}>✓</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* OCR Text Preview Card */}
      <Card className="shadow-md">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>Extracted Label Text</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
            {result.detected_text || 'No text detected from the image'}
          </pre>
        </CardContent>
      </Card>

      {/* Verification Metadata */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Verification ID: {result.id.slice(0, 8)}</span>
            <span>Verified at: {new Date(result.verified_at).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
