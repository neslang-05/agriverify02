'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessingOverlayProps {
  isVisible: boolean;
}

const PROCESSING_MESSAGES = [
  "Uploading images...",
  "Analyzing texture patterns...",
  "Checking seed quality...",
  "Detecting impurities...",
  "Generating results..."
];

export function ProcessingOverlay({ isVisible }: ProcessingOverlayProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % PROCESSING_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center",
        "bg-emerald-900/95 backdrop-blur-sm"
      )}
    >
      {/* Animated loader */}
      <div className="relative mb-8">
        <div className="w-24 h-24 border-4 border-emerald-700 rounded-full" />
        <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-white rounded-full animate-spin" />
        <Loader2 className="absolute inset-0 m-auto h-10 w-10 text-white animate-pulse" />
      </div>

      {/* Processing message */}
      <div className="text-center px-6">
        <p className="text-white text-xl font-medium mb-2 transition-opacity duration-300">
          {PROCESSING_MESSAGES[messageIndex]}
        </p>
        <p className="text-emerald-200 text-sm">
          Please wait while we analyze your images
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mt-8">
        {PROCESSING_MESSAGES.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === messageIndex 
                ? "bg-white w-6" 
                : index < messageIndex 
                ? "bg-emerald-400"
                : "bg-emerald-700"
            )}
          />
        ))}
      </div>
    </div>
  );
}
