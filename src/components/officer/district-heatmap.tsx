'use client';

import { motion } from 'framer-motion';
import { DistrictData } from '@/types';

interface DistrictHeatmapProps {
  data: DistrictData[];
}

const riskColors = {
  low: 'bg-green-100 hover:bg-green-200 border-green-200',
  medium: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-200',
  high: 'bg-red-100 hover:bg-red-200 border-red-200',
};

const riskTextColors = {
  low: 'text-green-800',
  medium: 'text-yellow-800',
  high: 'text-red-800',
};

export function DistrictHeatmap({ data }: DistrictHeatmapProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {data.map((district, index) => (
        <motion.div
          key={district.district}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ scale: 1.02 }}
          className={`p-4 border ${riskColors[district.risk_level]} cursor-pointer transition-colors`}
        >
          <h4 className="font-semibold text-neutral-900 text-sm mb-2 truncate">
            {district.district}
          </h4>
          <div className="space-y-1">
            <p className="text-xs text-neutral-600">
              Total: <span className="font-medium">{district.total}</span>
            </p>
            <p className={`text-xs font-medium ${riskTextColors[district.risk_level]}`}>
              {district.risk_level.toUpperCase()} RISK
            </p>
          </div>
          <div className="mt-2 flex gap-1">
            <div
              className="h-1 bg-green-500"
              style={{ width: `${(district.genuine / district.total) * 100}%` }}
            />
            <div
              className="h-1 bg-yellow-500"
              style={{ width: `${(district.suspicious / district.total) * 100}%` }}
            />
            <div
              className="h-1 bg-red-500"
              style={{ width: `${(district.fake / district.total) * 100}%` }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
