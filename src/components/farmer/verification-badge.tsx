'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { VerificationStatus } from '@/types';

interface VerificationBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  genuine: {
    label: 'Genuine',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  suspicious: {
    label: 'Suspicious',
    icon: AlertTriangle,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  },
  fake: {
    label: 'Fake',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
};

export function VerificationBadge({ status, size = 'md' }: VerificationBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Badge
        className={`rounded-none ${config.className} ${sizeClasses[size]} inline-flex items-center gap-1.5`}
      >
        <Icon className={iconSizes[size]} />
        {config.label}
      </Badge>
    </motion.div>
  );
}
