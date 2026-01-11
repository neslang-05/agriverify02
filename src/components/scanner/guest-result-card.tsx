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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Main Content with Gradient */}
      <div 
        className={cn(
          "flex-1",
          isGood 
            ? "bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-900" 
            : "bg-gradient-to-b from-red-500 via-red-600 to-red-900"
        )}
      >
        {/* Container for responsive layout */}
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-start lg:gap-8 lg:p-8">
          
          {/* Left Column: Result Info */}
          <div className="flex-1 p-6 lg:p-8 text-center lg:text-left lg:sticky lg:top-20">
            {/* Large Emoji */}
            <div className="text-6xl lg:text-8xl mb-4 animate-bounce lg:animate-none" style={{ animationDuration: '2s', animationIterationCount: '2' }}>
              {result.emoji}
            </div>

            {/* Status with Icon */}
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
              {isGood ? (
                <CheckCircle className="h-7 w-7 lg:h-10 lg:w-10 text-white" />
              ) : (
                <AlertTriangle className="h-7 w-7 lg:h-10 lg:w-10 text-white" />
              )}
              <h1 className="text-2xl lg:text-4xl font-bold text-white">
                {isGood ? 'Good Quality Seed' : 'Poor Quality / Suspicious'}
              </h1>
            </div>

            {/* Message */}
            <p className="text-white/90 text-base lg:text-lg leading-relaxed max-w-md mx-auto lg:mx-0 lg:mb-6">
              {result.message}
            </p>

            {/* Desktop Actions */}
          <div className="hidden lg:block space-y-3 max-w-sm">
            {isGood ? (
              <>
                <Button
                  onClick={onReset}
                  className="w-full rounded-lg bg-white text-emerald-800 hover:bg-emerald-50 h-14 text-lg font-semibold shadow-lg"
                >
                  <RefreshCcw className="h-5 w-5 mr-2" />
                  Scan Another Batch
                </Button>
                <button
                  onClick={onFileComplaint}
                  className="w-full rounded-lg h-12 border-2 border-white/60 text-white font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Report an Issue Anyway
                </button>
              </>
            ) : (
              <>
                <Button
                  onClick={onFileComplaint}
                  className="w-full rounded-lg bg-white text-red-700 hover:bg-red-50 h-14 text-lg font-semibold shadow-lg"
                >
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  File Complaint
                </Button>
                <button
                  onClick={onReset}
                  className="w-full rounded-lg h-12 border-2 border-white/60 text-white font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Scan Another Batch
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Images */}
        <div className="flex-1 lg:max-w-xl">
          {/* Captured Images Section */}
          {images.length > 0 && (
            <div className="bg-black/20 backdrop-blur-sm mx-4 lg:mx-0 rounded-2xl overflow-hidden">
              {/* Main Image */}
              <div className="relative aspect-video lg:aspect-[4/3] w-full">
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
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 lg:p-3 rounded-full hover:bg-black/70 transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 lg:p-3 rounded-full hover:bg-black/70 transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6" />
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
                        "flex-shrink-0 w-14 h-14 lg:w-16 lg:h-16 rounded-lg overflow-hidden border-2 transition-all",
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
        </div>
      </div>
    </div>

      {/* Mobile Actions - Fixed at Bottom */}
      <div className="lg:hidden p-4 space-y-3 bg-white border-t shadow-lg">
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
      <div className="p-3 bg-neutral-100 text-center lg:hidden">
        <p className="text-xs text-neutral-600 max-w-2xl mx-auto">
          AI-powered visual inspection. For official certification, contact your local agricultural department.
        </p>
      </div>
    </div>
  );
}
