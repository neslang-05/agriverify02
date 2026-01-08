'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, MapPin, Building2 } from 'lucide-react';
import { SeedRecommendation } from '@/types';

interface SeedRecommendationCardProps {
  recommendation: SeedRecommendation;
  index?: number;
}

const certificationColors = {
  certified: 'bg-green-100 text-green-800',
  registered: 'bg-blue-100 text-blue-800',
  approved: 'bg-purple-100 text-purple-800',
};

export function SeedRecommendationCard({ recommendation, index = 0 }: SeedRecommendationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -2 }}
    >
      <Card className="rounded-none shadow-md border-none h-full">
        <CardHeader className="border-b border-neutral-200 pb-4">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold text-neutral-900">
              {recommendation.variety_name}
            </CardTitle>
            <Badge
              className={`rounded-none ${certificationColors[recommendation.certification_status]}`}
            >
              <Award className="h-3 w-3 mr-1" />
              {recommendation.certification_status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <MapPin className="h-4 w-4 text-emerald-700" />
            <span>{recommendation.region}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Building2 className="h-4 w-4 text-emerald-700" />
            <span className="line-clamp-1">{recommendation.issuing_authority}</span>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {recommendation.description}
          </p>
          <div className="pt-2">
            <Badge variant="outline" className="rounded-none border-emerald-200 text-emerald-800">
              {recommendation.crop_type}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
