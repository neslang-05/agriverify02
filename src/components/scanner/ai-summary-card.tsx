'use client';

import React, { useState } from 'react';
import { RefreshCcw, AlertTriangle, CheckCircle, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { VerificationWithAISummary } from '@/types/packet-verification';

interface AISummaryCardProps {
  result: VerificationWithAISummary;
  isGuest?: boolean;
  images?: string[];
  onReset?: () => void;
  onFileComplaint?: () => void;
  onLogin?: () => void;
}

export function AISummaryCard({ 
  result, 
  isGuest = false,
  images = [],
  onReset, 
  onFileComplaint,
  onLogin
}: AISummaryCardProps) {
  const [showTechnical, setShowTechnical] = useState(false);
  
  // Guard against undefined result or missing properties
  if (!result || !result.ui || !result.technical) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Result</h2>
          <p className="text-gray-600 mb-4">Unable to display verification results.</p>
          {onReset && (
            <Button onClick={onReset}>Try Again</Button>
          )}
        </div>
      </div>
    );
  }
  
  const { ui, technical } = result;
  
  const statusColors = {
    good: {
      bg: 'bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-900',
      text: 'text-emerald-800',
      progressBg: 'bg-emerald-200',
    },
    average: {
      bg: 'bg-gradient-to-b from-yellow-500 via-yellow-600 to-yellow-800',
      text: 'text-yellow-800',
      progressBg: 'bg-yellow-200',
    },
    bad: {
      bg: 'bg-gradient-to-b from-red-500 via-red-600 to-red-900',
      text: 'text-red-800',
      progressBg: 'bg-red-200',
    }
  };

  const colors = statusColors[ui.status] || statusColors.bad;
  const isNotSeedImage = ui.title && ui.title.toLowerCase().includes('not a seed');

  // Render action buttons based on status
  const renderActionButtons = (isMobile = false) => {
    const containerClass = isMobile 
      ? "lg:hidden p-6 space-y-3" 
      : "hidden lg:block bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-3 mt-6";

    return (
      <div className={containerClass}>
        {isNotSeedImage ? (
          <>
            {onReset && (
              <Button
                onClick={onReset}
                className="w-full rounded-lg bg-white text-gray-800 hover:bg-gray-50 h-14 text-lg font-semibold shadow-lg"
              >
                <RefreshCcw className="h-5 w-5 mr-2" />
                Scan Again
              </Button>
            )}
          </>
        ) : ui.status === 'good' ? (
          <>
            {onReset && (
              <Button
                onClick={onReset}
                className="w-full rounded-lg bg-white text-emerald-800 hover:bg-emerald-50 h-14 text-lg font-semibold shadow-lg"
              >
                <RefreshCcw className="h-5 w-5 mr-2" />
                Scan Another Batch
              </Button>
            )}
            {onFileComplaint && (
              <button
                onClick={onFileComplaint}
                className="w-full rounded-lg h-12 border-2 border-white text-white font-medium hover:bg-white/10 transition-colors"
              >
                Report an Issue Anyway
              </button>
            )}
          </>
        ) : (
          <>
            {onFileComplaint && (
              <Button
                onClick={onFileComplaint}
                className="w-full rounded-lg bg-white text-red-700 hover:bg-red-50 h-14 text-lg font-semibold shadow-lg"
              >
                <AlertTriangle className="h-5 w-5 mr-2" />
                File Complaint
              </Button>
            )}
            {onReset && (
              <button
                onClick={onReset}
                className="w-full rounded-lg h-12 border-2 border-white text-white font-medium hover:bg-white/10 transition-colors flex items-center justify-center"
              >
                <RefreshCcw className="h-5 w-5 mr-2" />
                Scan Again
              </button>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Main Content with Gradient */}
      <div className={cn("flex-1", colors.bg)}>
        {/* Container for responsive layout */}
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-start lg:gap-8 lg:p-8">
          
          {/* Left Column: Result Info */}
          <div className="flex-1 p-6 lg:p-8">
            {/* AI Summary Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              {/* Large Emoji */}
              <div className="text-6xl text-center mb-4 animate-bounce" style={{ animationDuration: '2s', animationIterationCount: '2' }}>
                {ui.emoji}
              </div>

              {/* Status with Icon */}
              <div className="flex items-center justify-center gap-3 mb-4">
                {ui.status === 'good' ? (
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                )}
                <h1 className="text-3xl font-bold text-gray-900">
                  {ui.title}
                </h1>
              </div>

              {/* Mobile Image Display - Centered */}
              {images.length > 0 && (
                <div className="lg:hidden mb-6">
                  <div className="relative aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden mx-auto max-w-sm">
                    <img
                      src={images[0]}
                      alt="Uploaded seed image"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Simple Message */}
              <p className="text-gray-700 text-lg leading-relaxed text-center max-w-2xl mx-auto mb-6">
                {ui.message}
              </p>

              {/* Action Recommendation */}
              <div className={cn(
                "rounded-lg p-4 text-center font-medium mb-6",
                ui.status === 'good' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
              )}>
                <strong>What to do:</strong> {ui.action}
              </div>

              {/* Technical Details Section (Logged-in users only) */}
              {!isGuest && technical.predictions.length > 0 && (
                <div className="border-t pt-6">
                  <button
                    onClick={() => setShowTechnical(!showTechnical)}
                    className="w-full flex items-center justify-between text-left hover:bg-gray-50 rounded-lg p-3 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">Technical Analysis</span>
                    </div>
                    {showTechnical ? (
                      <ChevronUp className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    )}
                  </button>

                  {showTechnical && (
                    <div className="mt-4 space-y-4 animate-in slide-in-from-top-2">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Model Confidence</span>
                          <span className="text-sm font-bold text-gray-900">
                            {(technical.model_confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={technical.model_confidence * 100} className="h-2" />
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-700">Classification Breakdown:</p>
                        {technical.predictions
                          .sort((a, b) => b.probability - a.probability)
                          .slice(0, 5)
                          .map((pred, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 capitalize">
                                  {pred.tagName.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className="text-sm font-bold text-gray-900">
                                  {(pred.probability * 100).toFixed(1)}%
                                </span>
                              </div>
                              <Progress value={pred.probability * 100} className={cn("h-2", colors.progressBg)} />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Action Buttons - Desktop */}
            {renderActionButtons(false)}
          </div>

          {/* Right Column: Image Display - Desktop Only */}
          {images.length > 0 && (
            <div className="hidden lg:block lg:w-2/5 p-6 lg:p-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl lg:sticky lg:top-20">
                {/* Image Container */}
                <div className="relative aspect-[4/3] bg-gray-900">
                  <img
                    src={images[0]}
                    alt="Uploaded seed image"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Action Buttons */}
      {renderActionButtons(true)}
    </div>
  );
}
