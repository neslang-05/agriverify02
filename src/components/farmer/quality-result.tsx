"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertTriangle, Sparkles, FileText } from "lucide-react";

interface QualityResultProps {
  result: {
    status: "genuine" | "fake" | "suspicious";
    confidence: number;
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
    riskFactors: string[];
    recommendation: string;
  };
  imageUrl: string;
}

export function QualityResult({ result, imageUrl }: QualityResultProps) {
  const getQualityConfig = () => {
    // Use Vision AI tag as primary source of truth
    const tag = result.visionAI?.tag?.toLowerCase();
    
    // Azure Custom Vision model classifies as "Pure" (good) or "Negative" (bad)
    if (tag === "pure") {
      return {
        label: "Pure Quality",
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        badgeVariant: "default" as const,
        description: "Seeds meet quality standards"
      };
    } else if (tag === "negative" || tag === "impure") {
      return {
        label: "Negative Quality",
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        badgeVariant: "destructive" as const,
        description: "Seeds fail quality checks"
      };
    } else if (result.status === "genuine") {
      return {
        label: "Pure Quality",
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        badgeVariant: "default" as const,
        description: "Seeds meet quality standards"
      };
    } else if (result.status === "fake") {
      return {
        label: "Negative Quality",
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        badgeVariant: "destructive" as const,
        description: "Seeds fail quality checks"
      };
    } else {
      return {
        label: "Suspicious Quality",
        icon: AlertTriangle,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        badgeVariant: "secondary" as const,
        description: "Further inspection recommended"
      };
    }
  };

  const config = getQualityConfig();
  const Icon = config.icon;
  // Confidence is already 0-100 from Azure Custom Vision service
  const qualityScore = Math.round(result.visionAI?.confidence || result.confidence);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Quality Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quality Status */}
        <div className={`${config.bgColor} rounded-none p-6 text-center`}>
          <Icon className={`h-16 w-16 mx-auto mb-4 ${config.color}`} />
          <h3 className="text-2xl font-bold mb-2">{config.label}</h3>
          <p className="text-sm text-muted-foreground mb-4">{config.description}</p>
          <Badge variant={config.badgeVariant} className="text-lg px-4 py-2">
            Quality Score: {qualityScore}%
          </Badge>
        </div>

        {/* AI Classification */}
        {result.visionAI && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Classification
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Classification:</span>
                <Badge>{result.visionAI.tag}</Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Confidence Level:</span>
                  <span className="font-medium">{qualityScore}%</span>
                </div>
                <Progress value={qualityScore} className="h-2" />
              </div>
              {result.visionAI.seedVariety && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Variety:</span>
                  <span className="font-medium">{result.visionAI.seedVariety}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* OCR Extracted Data */}
        {result.ocr && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Label Information
            </h4>
            <div className="bg-gray-50 rounded-none p-4 space-y-2 text-sm">
              {result.ocr.brandName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Brand:</span>
                  <span className="font-medium">{result.ocr.brandName}</span>
                </div>
              )}
              {result.ocr.certificationNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Certification:</span>
                  <span className="font-mono text-xs">{result.ocr.certificationNumber}</span>
                </div>
              )}
              {result.ocr.batchNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Batch:</span>
                  <span className="font-mono text-xs">{result.ocr.batchNumber}</span>
                </div>
              )}
              {result.ocr.manufacturingDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mfg. Date:</span>
                  <span className="font-medium">{result.ocr.manufacturingDate}</span>
                </div>
              )}
              {result.ocr.expiryDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expiry:</span>
                  <span className="font-medium">{result.ocr.expiryDate}</span>
                </div>
              )}
              {result.ocr.detectedText && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-muted-foreground hover:text-primary">
                    View full text
                  </summary>
                  <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-32 whitespace-pre-wrap">
                    {result.ocr.detectedText}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}

        {/* Risk Factors */}
        {result.riskFactors.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Quality Issues Detected
            </h4>
            <ul className="space-y-2">
              {result.riskFactors.map((factor, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendation */}
        <div className="bg-blue-50 rounded-none p-4">
          <h4 className="font-semibold mb-2 text-blue-900">Recommendation</h4>
          <p className="text-sm text-blue-800">{result.recommendation}</p>
        </div>

        {/* Image Preview */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Analyzed Image</h4>
          <div className="relative aspect-video rounded-none overflow-hidden border">
            <img
              src={imageUrl}
              alt="Analyzed seed"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
