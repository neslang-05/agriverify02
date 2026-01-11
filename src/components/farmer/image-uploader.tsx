'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DualImageUploaderProps {
  onFrontImageSelect: (file: File) => void;
  onBackImageSelect: (file: File) => void;
  onFrontImageRemove: () => void;
  onBackImageRemove: () => void;
  frontImage: File | null;
  backImage: File | null;
  disabled?: boolean;
}

/**
 * Dual Image Uploader Component
 * Allows farmers to upload both front and back images of seed packets
 */
export function ImageUploader({
  onFrontImageSelect,
  onBackImageSelect,
  onFrontImageRemove,
  onBackImageRemove,
  frontImage,
  backImage,
  disabled = false,
}: DualImageUploaderProps) {
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [frontDragging, setFrontDragging] = useState(false);
  const [backDragging, setBackDragging] = useState(false);

  const handleFileSelect = useCallback(
    (file: File, side: 'front' | 'back') => {
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const preview = reader.result as string;
          if (side === 'front') {
            onFrontImageSelect(file);
            setFrontPreview(preview);
          } else {
            onBackImageSelect(file);
            setBackPreview(preview);
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [onFrontImageSelect, onBackImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, side: 'front' | 'back') => {
      e.preventDefault();
      if (side === 'front') setFrontDragging(false);
      else setBackDragging(false);
      
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file, side);
    },
    [handleFileSelect]
  );

  const handleDragOver = (side: 'front' | 'back') => (e: React.DragEvent) => {
    e.preventDefault();
    if (side === 'front') setFrontDragging(true);
    else setBackDragging(true);
  };

  const handleDragLeave = (side: 'front' | 'back') => () => {
    if (side === 'front') setFrontDragging(false);
    else setBackDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file, side);
  };

  const handleRemove = (side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontPreview(null);
      onFrontImageRemove();
    } else {
      setBackPreview(null);
      onBackImageRemove();
    }
  };

  const uploadBox = (
    side: 'front' | 'back',
    image: File | null,
    preview: string | null,
    isDragging: boolean
  ) => {
    const sideLabel = side === 'front' ? 'Front' : 'Back';
    const otherImage = side === 'front' ? backImage : frontImage;
    
    if (image && preview) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative"
        >
          <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
            <img
              src={preview}
              alt={`${sideLabel} of product`}
              className="h-full w-full object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 rounded-none bg-white/90 hover:bg-white"
              onClick={() => handleRemove(side)}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="absolute top-2 left-2 bg-emerald-800 text-white px-2 py-1 text-xs font-medium flex items-center gap-1 rounded-none">
              <CheckCircle2 className="h-3 w-3" />
              {sideLabel} Side
            </div>
          </div>
          <p className="mt-2 text-sm text-neutral-500 text-center">
            {image.name}
          </p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          onDrop={(e) => handleDrop(e, side)}
          onDragOver={handleDragOver(side)}
          onDragLeave={handleDragLeave(side)}
          className={`border-2 border-dashed rounded-none p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-emerald-800 bg-emerald-50'
              : 'border-neutral-300 hover:border-emerald-800 hover:bg-emerald-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleInputChange(e, side)}
            disabled={disabled}
            className="hidden"
            id={`image-input-${side}`}
          />
          <label
            htmlFor={`image-input-${side}`}
            className="flex flex-col items-center gap-3 cursor-pointer"
          >
            <div className="h-12 w-12 flex items-center justify-center rounded-none bg-neutral-100">
              <ImageIcon className="h-6 w-6 text-neutral-400" />
            </div>
            <div>
              <p className="font-medium text-neutral-900">Upload {sideLabel} Image</p>
              <p className="text-sm text-neutral-500">Click or drag image here</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none"
              disabled={disabled}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`image-input-${side}`)?.click();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Image
            </Button>
          </label>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`h-6 w-6 flex items-center justify-center text-sm font-medium rounded-none ${
              frontImage
                ? 'bg-emerald-800 text-white'
                : 'bg-neutral-200 text-neutral-500'
            }`}>
              {frontImage ? '✓' : '1'}
            </div>
            <span className="text-sm font-medium text-neutral-700">Front Side</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`h-6 w-6 flex items-center justify-center text-sm font-medium rounded-none ${
              backImage
                ? 'bg-emerald-800 text-white'
                : 'bg-neutral-200 text-neutral-500'
            }`}>
              {backImage ? '✓' : '2'}
            </div>
            <span className="text-sm font-medium text-neutral-700">Back Side</span>
          </div>
        </div>
      </div>

      {/* Image Upload Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {uploadBox('front', frontImage, frontPreview, frontDragging)}
        {uploadBox('back', backImage, backPreview, backDragging)}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-none p-4">
        <p className="text-sm text-blue-900 font-medium mb-2">📷 Tips for best results:</p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ensure good lighting and clear visibility of all text</li>
          <li>• Capture the entire packet front and back</li>
          <li>• Avoid shadows or glare</li>
          <li>• Both images are required for verification</li>
        </ul>
      </div>
    </div>
  );
}
