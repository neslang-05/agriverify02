'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  description?: string;
}

export function StatCard({ title, value, icon: Icon, trend, description }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="rounded-none shadow-md border-none bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-500">{title}</p>
              <p className="text-3xl font-semibold text-neutral-900">{value}</p>
              {description && (
                <p className="text-xs text-neutral-400">{description}</p>
              )}
              {trend !== undefined && (
                <p
                  className={`text-xs font-medium ${
                    trend >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {trend >= 0 ? '+' : ''}
                  {trend}% from last week
                </p>
              )}
            </div>
            <div className="h-12 w-12 flex items-center justify-center bg-emerald-50">
              <Icon className="h-6 w-6 text-emerald-800" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
