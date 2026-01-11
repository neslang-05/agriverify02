'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, ImageIcon, Plus, Leaf, SwitchCamera, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CameraScannerProps {
  onCapture: (images: string[]) => void;
  onAnalyze: () => void;
  maxImages?: number;
  disabled?: boolean;
}

export function CameraScanner({ 
  onCapture, 
  onAnalyze, 
  maxImages = 5,
  disabled = false 
}: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [images, setImages] = useState<string[]>([]);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isStreamReady, setIsStreamReady] = useState(false);

  // Notify parent of image changes via useEffect to avoid setState during render
  useEffect(() => {
    if (pendingImages.length > 0) {
      onCapture(pendingImages);
    }
  }, [pendingImages, onCapture]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Attach stream to video when both are ready
  useEffect(() => {
    if (showCamera && isStreamReady && streamRef.current && videoRef.current) {
      const video = videoRef.current;
      
      // Only set srcObject if it's different
      if (video.srcObject !== streamRef.current) {
        video.srcObject = streamRef.current;
      }
      
      // Only play if not already playing
      if (video.paused) {
        video.play().catch((err) => {
          // Ignore AbortError - it's expected when component unmounts or re-renders
          if (err.name !== 'AbortError') {
            console.error('Video play error:', err);
          }
        });
      }
    }
  }, [showCamera, isStreamReady]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsStreamReady(false);
    setShowCamera(true); // Show camera UI first
    
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      streamRef.current = stream;
      setIsStreamReady(true); // Trigger useEffect to attach stream
      
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Unable to access camera. Please check permissions or use Gallery.');
      setShowCamera(false);
    }
  }, [facingMode]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setIsStreamReady(false);
  }, []);

  // Capture photo from video stream
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    
    const updatedImages = [...images, imageData];
    setImages(updatedImages);
    setPendingImages(updatedImages);
    
    // Close camera after capture if at max
    if (updatedImages.length >= maxImages) {
      stopCamera();
    }
  }, [images, maxImages, stopCamera]);

  // Switch camera (front/back)
  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  }, []);

  // Restart camera when facing mode changes
  useEffect(() => {
    if (showCamera) {
      startCamera();
    }
  }, [facingMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle file selection (from gallery)
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    let processedCount = 0;
    const newImages: string[] = [];

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        processedCount++;
        
        if (processedCount === filesToProcess.length) {
          const updatedImages = [...images, ...newImages];
          setImages(updatedImages);
          setPendingImages(updatedImages);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  }, [images, maxImages]);

  // Remove image from array
  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setPendingImages(newImages);
  }, [images]);

  // Trigger gallery picker
  const openGallery = () => {
    galleryInputRef.current?.click();
  };

  // Live Camera View
  if (showCamera) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
          <p className="text-white text-center font-medium">
            Point at seed packet and tap to capture
          </p>
        </div>
        
        {/* Video feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={(e) => {
            const video = e.currentTarget;
            if (video.paused) {
              video.play().catch((err) => {
                if (err.name !== 'AbortError') {
                  console.error('Video play error:', err);
                }
              });
            }
          }}
          style={{ minHeight: '50vh' }}
          className="flex-1 w-full object-cover bg-neutral-900"
        />
        
        {/* Loading indicator when video hasn't loaded */}
        {!isStreamReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-white text-center">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p>Starting camera...</p>
            </div>
          </div>
        )}
        
        {/* Camera controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-8">
          {/* Captured Images Preview Strip */}
          {images.length > 0 && (
            <div className="px-4 mb-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <div key={index} className="relative flex-shrink-0">
                    <img
                      src={img}
                      alt={`Captured ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border-2 border-white/50"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Image count */}
          <div className="text-center mb-4">
            <span className="text-white text-sm font-medium">
              {images.length} / {maxImages} images captured
            </span>
            {images.length > 0 && (
              <button
                onClick={stopCamera}
                className="ml-3 px-3 py-1 bg-emerald-600 text-white text-sm rounded-full hover:bg-emerald-700 transition-colors"
              >
                Done
              </button>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-8 pb-6">
            {/* Close button */}
            <button
              onClick={stopCamera}
              className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
            
            {/* Capture button */}
            <button
              onClick={capturePhoto}
              disabled={images.length >= maxImages}
              className="w-20 h-20 rounded-full bg-white border-4 border-white/50 flex items-center justify-center hover:scale-105 transition-transform active:scale-95 disabled:opacity-50"
            >
              <div className="w-16 h-16 rounded-full bg-white" />
            </button>
            
            {/* Switch camera button */}
            <button
              onClick={switchCamera}
              className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <SwitchCamera className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-800 via-emerald-900 to-emerald-950">
      {/* Hidden gallery input */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
      
      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {images.length === 0 ? (
          // Empty State - Show capture options
          <div className="text-center w-full max-w-sm">
            {/* Decorative elements */}
            <div className="absolute top-20 left-4 opacity-10">
              <Leaf className="h-32 w-32 text-white" />
            </div>
            <div className="absolute bottom-20 right-4 opacity-10">
              <Leaf className="h-24 w-24 text-white rotate-45" />
            </div>

            <div className="mb-10 relative z-10">
              <h2 className="text-3xl font-bold text-white mb-3">
                Verify Seed Quality
              </h2>
              <p className="text-emerald-200/80 text-lg">
                AI-powered analysis to detect fake or damaged seeds
              </p>
            </div>

            {/* Camera Error Message */}
            {cameraError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 text-sm">
                {cameraError}
              </div>
            )}

            {/* Large Animated Camera Button */}
            <button
              onClick={startCamera}
              className="group relative w-40 h-40 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:border-white/50 active:scale-95"
            >
              {/* Pulse animation ring */}
              <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-2 rounded-full border-2 border-white/10 animate-pulse" />
              
              {/* Camera icon */}
              <Camera className="h-16 w-16 text-white group-hover:scale-110 transition-transform duration-300" />
            </button>

            <p className="text-white text-xl font-medium mb-4">
              Tap to Open Camera
            </p>

            {/* Gallery Button - smaller, below main button */}
            <button
              onClick={openGallery}
              className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-full bg-white/10 border border-white/30 text-white/90 hover:bg-white/20 hover:border-white/50 transition-all text-sm"
            >
              <ImageIcon className="h-4 w-4" />
              Choose from Gallery
            </button>

            <p className="text-emerald-200/60 text-sm mt-6">
              Upload up to {maxImages} images for accurate results
            </p>
          </div>
        ) : (
          // Images Added - Show grid with add more option
          <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-white">
                {images.length} {images.length === 1 ? 'Image' : 'Images'} Ready
              </h2>
              <p className="text-emerald-200/70 text-sm">
                {images.length < maxImages 
                  ? `Add up to ${maxImages - images.length} more or analyze now`
                  : 'Maximum images reached'}
              </p>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={img}
                    alt={`Captured ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors shadow-lg"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Add More Button */}
              {images.length < maxImages && (
                <button
                  onClick={openGallery}
                  className="aspect-square border-2 border-dashed border-white/30 rounded-lg flex flex-col items-center justify-center text-white/60 hover:border-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Plus className="h-8 w-8 mb-1" />
                  <span className="text-xs">Add</span>
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={onAnalyze}
                disabled={disabled}
                className="w-full h-14 rounded-lg bg-white text-emerald-900 hover:bg-emerald-50 text-lg font-semibold shadow-lg"
              >
                Analyze Seeds
              </Button>

              {images.length < maxImages && (
                <div className="flex gap-2">
                  <button
                    onClick={startCamera}
                    className="flex-1 h-11 rounded-lg border border-white/40 bg-white/10 text-white font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Camera
                  </button>
                  <button
                    onClick={openGallery}
                    className="flex-1 h-11 rounded-lg border border-white/40 bg-white/10 text-white font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Gallery
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom indicator */}
      <div className="p-4 text-center">
        <p className="text-emerald-200/50 text-xs">
          {images.length} / {maxImages} images
        </p>
      </div>
    </div>
  );
}
