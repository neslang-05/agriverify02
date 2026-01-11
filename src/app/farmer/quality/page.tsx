"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, History, Camera, Loader2 } from "lucide-react";
import { QualityResult } from "@/components/farmer/quality-result";
import { uploadAndVerify } from "@/app/actions/verification";
import Link from "next/link";

interface QualityCheckResult {
  status: "genuine" | "fake" | "suspicious";
  confidence: number;
  visionAI?: {
    tag: string;
    confidence: number;
    seedVariety?: string;
  };
  riskFactors: string[];
  recommendation: string;
}

export default function SeedQualityPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<QualityCheckResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);

      const response = await uploadAndVerify(formData);

      // Map HybridVerificationResult to QualityCheckResult
      setResult({
        status: response.status,
        confidence: response.confidence,
        visionAI: response.visionAI,
        riskFactors: response.riskFactors || [],
        recommendation: response.risk_explanation || 'No recommendation available'
      });
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Seed Quality Verification</h1>
          <p className="text-muted-foreground">
            Upload seed images to verify quality and authenticity
          </p>
        </div>
        <Link href="/farmer/history">
          <Button variant="outline" size="lg">
            <History className="mr-2 h-5 w-5" />
            View History
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Seed Image</CardTitle>
            <CardDescription>
              Take a clear photo of the seed packet or seeds for analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!previewUrl ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Choose an image</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    PNG, JPG up to 10MB
                  </p>
                  <Button type="button" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Select Image
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden border">
                  <img
                    src={previewUrl}
                    alt="Selected seed"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="flex-1"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Quality"
                    )}
                  </Button>
                  <Button onClick={handleReset} variant="outline" size="lg">
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <div>
          {result ? (
            <QualityResult result={result} imageUrl={previewUrl || ""} />
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium mb-2">No Analysis Yet</p>
                <p className="text-sm text-muted-foreground">
                  Upload an image to see quality results
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold text-lg">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Pure Quality</h3>
                <p className="text-sm text-muted-foreground">
                  Seeds meet quality standards and are genuine
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-bold text-lg">✕</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Negative Quality</h3>
                <p className="text-sm text-muted-foreground">
                  Seeds fail quality checks or may be counterfeit
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <History className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Track History</h3>
                <p className="text-sm text-muted-foreground">
                  Access all your previous verification results
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
