'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUploader } from '@/components/farmer/image-uploader';
import { VerificationBadge } from '@/components/farmer/verification-badge';
import { ConfidenceMeter } from '@/components/farmer/confidence-meter';
import { uploadAndVerify } from '@/app/actions/verification';
import { CROP_TYPES, DISTRICTS } from '@/types';
import { VerificationResult } from '@/types';

type Step = 'upload' | 'details' | 'processing' | 'result';

export default function VerifyPage() {
  const [step, setStep] = useState<Step>('upload');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [cropType, setCropType] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
  };

  const handleNext = () => {
    if (step === 'upload' && selectedImage) {
      setStep('details');
    } else if (step === 'details' && cropType && district) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('upload');
    } else if (step === 'result') {
      resetForm();
    }
  };

  const resetForm = () => {
    setStep('upload');
    setSelectedImage(null);
    setCropType('');
    setDistrict('');
    setResult(null);
  };

  const handleSubmit = async () => {
    setStep('processing');

    const formData = new FormData();
    if (selectedImage) {
      formData.append('image', selectedImage);
    }
    formData.append('cropType', cropType);
    formData.append('district', district);

    try {
      const verificationResult = await uploadAndVerify(formData);
      setResult(verificationResult);
      setStep('result');
    } catch (error) {
      console.error('Verification failed:', error);
      setStep('details');
    }
  };

  const getResultIcon = () => {
    if (!result) return null;
    switch (result.status) {
      case 'genuine':
        return <CheckCircle2 className="h-16 w-16 text-green-600" />;
      case 'suspicious':
        return <AlertTriangle className="h-16 w-16 text-yellow-600" />;
      case 'fake':
        return <XCircle className="h-16 w-16 text-red-600" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-neutral-900">Verify Product</h1>
        <p className="text-neutral-500 mt-1">
          Upload an image of the seed or fertilizer package to verify authenticity.
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {['upload', 'details', 'result'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`h-8 w-8 flex items-center justify-center text-sm font-medium ${
                step === s || (step === 'processing' && s === 'details')
                  ? 'bg-emerald-800 text-white'
                  : step === 'result' || (step === 'processing' && i < 2)
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-neutral-200 text-neutral-500'
              }`}
            >
              {i + 1}
            </div>
            {i < 2 && (
              <div
                className={`w-12 h-0.5 ${
                  step === 'result' || (step === 'processing' && i < 1)
                    ? 'bg-emerald-800'
                    : 'bg-neutral-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="rounded-none shadow-md border-none">
              <CardHeader className="border-b border-neutral-200 pb-4">
                <CardTitle className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-emerald-800" />
                  Step 1: Upload Image
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <ImageUploader
                  onImageSelect={handleImageSelect}
                  onImageRemove={handleImageRemove}
                  selectedImage={selectedImage}
                />
                <Button
                  onClick={handleNext}
                  disabled={!selectedImage}
                  className="w-full rounded-none bg-emerald-800 hover:bg-emerald-900"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="rounded-none shadow-md border-none">
              <CardHeader className="border-b border-neutral-200 pb-4">
                <CardTitle className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-800" />
                  Step 2: Product Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label>Crop Type</Label>
                  <Select value={cropType} onValueChange={setCropType}>
                    <SelectTrigger className="rounded-none border-2 focus:border-emerald-800 focus:ring-0">
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      {CROP_TYPES.map((crop) => (
                        <SelectItem key={crop} value={crop} className="rounded-none">
                          {crop}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>District</Label>
                  <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger className="rounded-none border-2 focus:border-emerald-800 focus:ring-0">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none max-h-48">
                      {DISTRICTS.map((d) => (
                        <SelectItem key={d} value={d} className="rounded-none">
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 rounded-none border-2"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!cropType || !district}
                    className="flex-1 rounded-none bg-emerald-800 hover:bg-emerald-900"
                  >
                    Verify
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="rounded-none shadow-md border-none">
              <CardContent className="py-16">
                <div className="flex flex-col items-center justify-center text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-emerald-800 mb-4" />
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    Analyzing Product
                  </h3>
                  <p className="text-neutral-500">
                    Extracting text and verifying authenticity...
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Main Result Card */}
            <Card className="rounded-none shadow-md border-none">
              <CardContent className="py-8">
                <div className="flex flex-col items-center text-center">
                  {getResultIcon()}
                  <div className="mt-4 mb-6">
                    <VerificationBadge status={result.status} size="lg" />
                  </div>
                  <ConfidenceMeter value={result.confidence} size="lg" />
                </div>
              </CardContent>
            </Card>

            {/* Detected Text */}
            <Card className="rounded-none shadow-md border-none">
              <CardHeader className="border-b border-neutral-200 pb-4">
                <CardTitle className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-800" />
                  Extracted Text
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <pre className="text-sm text-neutral-700 whitespace-pre-wrap bg-neutral-50 p-4 border border-neutral-200">
                  {result.detected_text}
                </pre>
              </CardContent>
            </Card>

            {/* Risk Explanation */}
            <Card className="rounded-none shadow-md border-none">
              <CardHeader className="border-b border-neutral-200 pb-4">
                <CardTitle className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-emerald-800" />
                  Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-neutral-700 leading-relaxed">
                  {result.risk_explanation}
                </p>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="rounded-none shadow-md border-none">
              <CardHeader className="border-b border-neutral-200 pb-4">
                <CardTitle className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-emerald-800" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={resetForm}
                className="flex-1 rounded-none border-2 border-emerald-800 text-emerald-800 hover:bg-emerald-50"
              >
                Verify Another Product
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
