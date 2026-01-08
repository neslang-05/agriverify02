'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  selectedImage: File | null;
  disabled?: boolean;
}

export function ImageUploader({
  onImageSelect,
  onImageRemove,
  selectedImage,
  disabled = false,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (file && file.type.startsWith('image/')) {
        onImageSelect(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onImageRemove();
  };

  if (selectedImage && preview) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
          <img
            src={preview}
            alt="Selected product"
            className="h-full w-full object-contain"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 rounded-none bg-white/90 hover:bg-white"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-sm text-neutral-500 text-center">
          {selectedImage.name}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label
        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed cursor-pointer transition-colors ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <div className="h-12 w-12 flex items-center justify-center bg-emerald-100 mb-4">
            <Upload className="h-6 w-6 text-emerald-800" />
          </div>
          <p className="mb-2 text-sm text-neutral-700">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-neutral-500">
            PNG, JPG or JPEG (MAX. 10MB)
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleInputChange}
          disabled={disabled}
        />
      </label>
    </motion.div>
  );
}
