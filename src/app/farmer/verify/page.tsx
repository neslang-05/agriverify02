'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploader } from '@/components/farmer/image-uploader';
import { VerificationResult as VerificationResultComponent } from '@/components/farmer/verification-result';
import { uploadAndVerify } from '@/app/actions/verification';
import { VerificationResult } from '@/types';
import { predictSeedImage } from '@/lib/edge/teachable-machine-client';
import { toast } from 'sonner';

type Step = 'upload' | 'processing' | 'result';

export default function VerifyPage() {
  const [step, setStep] = useState<Step>('upload');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleFrontImageSelect = (file: File) => {
    setFrontImage(file);
  };

  const handleBackImageSelect = (file: File) => {
    setBackImage(file);
  };

  const handleFrontImageRemove = () => {
    setFrontImage(null);
  };

  const handleBackImageRemove = () => {
    setBackImage(null);
  };

  const handleVerify = async () => {
    if (!frontImage || !backImage) return;
    
    setStep('processing');

    try {
      // 1. Client-side Fast Inference for Seed Verification
      const img = new Image();
      const objectUrl = URL.createObjectURL(frontImage);
      
      img.src = objectUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      try {
        const prediction = await predictSeedImage(img);
        
        if (!prediction.isSeed && prediction.confidence > 0.6) {
          toast.error('Invalid Image Detected', {
            description: 'This does not appear to be a seed packet. Please upload a clear image of a seed packet.',
          });
          setStep('upload');
          URL.revokeObjectURL(objectUrl);
          return;
        }
      } catch (inferenceError) {
        console.error('TM inference failed, falling back to cloud:', inferenceError);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }

      // 2. Proceed to Cloud Processing
      const formData = new FormData();
      formData.append('frontImage', frontImage);
      formData.append('backImage', backImage);

      const verificationResult = await uploadAndVerify(formData);
      setResult(verificationResult);
      setStep('result');
    } catch (error) {
      console.error('Verification failed:', error);
      toast.error('Verification Failed', {
        description: 'An error occurred during verification. Please try again.',
      });
      setStep('upload');
    }
  };

  const resetForm = () => {
    setStep('upload');
    setFrontImage(null);
    setBackImage(null);
    setResult(null);
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

      {/* Progress Steps - Now front/back selection + result */}
      <div className="flex items-center gap-2">
        {['upload', 'result'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`h-8 w-8 flex items-center justify-center text-sm font-medium ${
                step === s || (step === 'processing' && s === 'upload')
                  ? 'bg-emerald-800 text-white'
                  : step === 'result'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-neutral-200 text-neutral-500'
              }`}
            >
              {i + 1}
            </div>
            {i < 1 && (
              <div
                className={`w-12 h-0.5 ${
                  step === 'result' || step === 'processing'
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
                  Upload Seed Packet Images
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <ImageUploader
                  onFrontImageSelect={handleFrontImageSelect}
                  onBackImageSelect={handleBackImageSelect}
                  onFrontImageRemove={handleFrontImageRemove}
                  onBackImageRemove={handleBackImageRemove}
                  frontImage={frontImage}
                  backImage={backImage}
                />
                <Button
                  onClick={handleVerify}
                  disabled={!frontImage || !backImage}
                  className="w-full rounded-none bg-emerald-800 hover:bg-emerald-900"
                >
                  Verify Product
                </Button>
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
                    Verifying product authenticity...
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
            {/* Use the new VerificationResult component */}
            <VerificationResultComponent result={result} />

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
