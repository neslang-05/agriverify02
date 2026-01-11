'use client';

import React, { useState } from 'react';
import { RefreshCcw, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GuestResultCardProps {
  result: {
    status: 'good' | 'bad';
    emoji: string;
    message: string;
    avgGood?: number;
    avgBad?: number;
  };
  images?: string[];
  onReset: () => void;
  onFileComplaint: () => void;
}

export function GuestResultCard({ result, images = [], onReset, onFileComplaint }: GuestResultCardProps) {
  const isGood = result.status === 'good';
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
  };

  return (
    <div 
      className={cn(
        "flex flex-col min-h-[calc(100vh-4rem)]",
        isGood 
          ? "bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-900" 
          : "bg-gradient-to-b from-red-500 via-red-600 to-red-900"
      )}
    >
      {/* Result Section - At Top, Large */}
      <div className="p-6 text-center">
        {/* Large Emoji */}
        <div className="text-7xl mb-4 animate-bounce" style={{ animationDuration: '2s', animationIterationCount: '2' }}>
          {result.emoji}
        </div>

        {/* Status with Icon */}
        <div className="flex items-center justify-center gap-3 mb-4">
          {isGood ? (
            <CheckCircle className="h-8 w-8 text-white" />
          ) : (
            <AlertTriangle className="h-8 w-8 text-white" />
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {isGood ? 'Good Quality Seed' : 'Poor Quality / Suspicious'}
          </h1>
        </div>

        {/* Quality Score Bar */}
        {result.avgGood !== undefined && (
          <div className="w-full max-w-sm mx-auto mb-4">
            <div className="flex justify-between text-white/80 text-sm mb-2">
              <span className="font-medium">Quality Score</span>
              <span className="font-bold text-lg">{Math.round((result.avgGood || 0) * 100)}%</span>
            </div>
            <div className="h-3 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(result.avgGood || 0) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Message */}
        <p className="text-white/90 text-base sm:text-lg leading-relaxed max-w-md mx-auto">
          {result.message}
        </p>
      </div>

      {/* Captured Images Section */}
      {images.length > 0 && (
        <div className="flex-1 bg-black/20 backdrop-blur-sm mx-4 rounded-t-2xl overflow-hidden">
          {/* Main Image */}
          <div className="relative aspect-video w-full">
            <img
              src={images[currentImageIndex]}
              alt={`Scanned image ${currentImageIndex + 1}`}
              className="w-full h-full object-contain bg-black/40"
            />
            
            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-1.5 text-sm rounded-full font-medium">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto justify-center bg-black/20">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all",
                    index === currentImageIndex 
                      ? "border-white scale-105" 
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 space-y-3 bg-white">
        {isGood ? (
          <>
            <Button
              onClick={onReset}
              className="w-full rounded-lg bg-emerald-700 hover:bg-emerald-800 h-14 text-lg font-semibold"
            >
              <RefreshCcw className="h-5 w-5 mr-2" />
              Scan Another Batch
            </Button>
            <Button
              onClick={onFileComplaint}
              variant="outline"
              className="w-full rounded-lg h-12 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Report an Issue Anyway
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={onFileComplaint}
              className="w-full rounded-lg bg-red-600 hover:bg-red-700 h-14 text-lg font-semibold"
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              File Complaint
            </Button>
            <Button
              onClick={onReset}
              variant="outline"
              className="w-full rounded-lg h-12"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Scan Another Batch
            </Button>
          </>
        )}
      </div>

      {/* Disclaimer */}
      <div className="p-3 bg-neutral-100 text-center">
        <p className="text-xs text-neutral-500">
          AI-powered visual inspection. For official certification, contact your local agricultural department.
        </p>
      </div>
    </div>
  );
}
