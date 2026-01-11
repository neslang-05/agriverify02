'use client';

import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface ConfidenceMeterProps {
  value: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceMeter({ value, showLabel = true, size = 'md' }: ConfidenceMeterProps) {
  const getColor = (val: number) => {
    if (val >= 80) return 'bg-green-500';
    if (val >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getLabel = (val: number) => {
    if (val >= 80) return 'High Confidence';
    if (val >= 60) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-700">{getLabel(value)}</span>
          <span className="text-sm font-semibold text-neutral-900">{value}%</span>
        </div>
      )}
      <div className={`relative w-full bg-neutral-200 ${heightClasses[size]} rounded-none overflow-hidden`}>
        <motion.div
          className={`absolute top-0 left-0 h-full ${getColor(value)}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
