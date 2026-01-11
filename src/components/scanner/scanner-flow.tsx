'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CameraScanner, ProcessingOverlay, GuestResultCard, PhoneAuthDrawer } from '@/components/scanner';
import { processGuestImages } from '@/app/actions/guest-verification';

// Storage key for persisting scan data across auth
const SCAN_DATA_KEY = 'agriverify_guest_scan';

interface ScanResult {
  status: 'good' | 'bad';
  emoji: string;
  message: string;
  avgGood: number;
  avgBad: number;
  isFlagged: boolean;
}

type ViewState = 'camera' | 'processing' | 'result';

export function ScannerFlow() {
  const router = useRouter();
  const [viewState, setViewState] = useState<ViewState>('camera');
  const [images, setImages] = useState<string[]>([]);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [showAuthDrawer, setShowAuthDrawer] = useState(false);

  // Handle image capture
  const handleCapture = (capturedImages: string[]) => {
    setImages(capturedImages);
  };

  // Handle analyze button click
  const handleAnalyze = async () => {
    if (images.length === 0) return;

    setViewState('processing');

    try {
      const analysisResult = await processGuestImages(images);
      setResult(analysisResult);
      
      // Store scan data for potential complaint flow
      localStorage.setItem(SCAN_DATA_KEY, JSON.stringify({
        images,
        result: analysisResult,
        timestamp: Date.now()
      }));

      setViewState('result');
    } catch (error) {
      console.error('Analysis error:', error);
      setResult({
        status: 'bad',
        emoji: '⚠️',
        message: 'Analysis failed. Please try again.',
        avgGood: 0,
        avgBad: 0,
        isFlagged: false
      });
      setViewState('result');
    }
  };

  // Reset to camera view
  const handleReset = () => {
    setImages([]);
    setResult(null);
    setViewState('camera');
    localStorage.removeItem(SCAN_DATA_KEY);
  };

  // Handle file complaint action
  const handleFileComplaint = () => {
    setShowAuthDrawer(true);
  };

  // Handle successful authentication
  const handleAuthSuccess = (isNewUser: boolean) => {
    setShowAuthDrawer(false);
    // Navigate to complaint form with scan data preserved in localStorage
    router.push('/farmer/complaints/new?from_scan=true');
  };

  // Check for existing scan data on mount (for returning from auth flow)
  useEffect(() => {
    const storedData = localStorage.getItem(SCAN_DATA_KEY);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        // Only restore if data is less than 30 minutes old
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          setImages(parsed.images || []);
          if (parsed.result) {
            setResult(parsed.result);
            setViewState('result');
          }
        } else {
          localStorage.removeItem(SCAN_DATA_KEY);
        }
      } catch (e) {
        localStorage.removeItem(SCAN_DATA_KEY);
      }
    }
  }, []);

  return (
    <>
      {/* Camera View */}
      {viewState === 'camera' && (
        <CameraScanner
          onCapture={handleCapture}
          onAnalyze={handleAnalyze}
          maxImages={5}
        />
      )}

      {/* Processing Overlay */}
      <ProcessingOverlay isVisible={viewState === 'processing'} />

      {/* Result View */}
      {viewState === 'result' && result && (
        <GuestResultCard
          result={result}
          images={images}
          onReset={handleReset}
          onFileComplaint={handleFileComplaint}
        />
      )}

      {/* Auth Drawer */}
      <PhoneAuthDrawer
        isOpen={showAuthDrawer}
        onClose={() => setShowAuthDrawer(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
