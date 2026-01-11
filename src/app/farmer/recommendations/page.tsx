'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sprout, Filter, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SeedRecommendationCard } from '@/components/farmer/seed-recommendation-card';
import { EmptyState } from '@/components/ui/empty-state';
import { getSeedRecommendations } from '@/app/actions/verification';
import { CROP_TYPES, DISTRICTS, SeedRecommendation } from '@/types';

export default function RecommendationsPage() {
  const [cropType, setCropType] = useState<string>('Rice');
  const [district, setDistrict] = useState<string>('Hyderabad');
  const [recommendations, setRecommendations] = useState<SeedRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecommendations() {
      setLoading(true);
      try {
        const data = await getSeedRecommendations(cropType, district);
        setRecommendations(data);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setLoading(false);
      }
    }
    loadRecommendations();
  }, [cropType, district]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-neutral-900">Seed Recommendations</h1>
        <p className="text-neutral-500 mt-1">
          Find government-certified seed varieties for your region.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="rounded-none shadow-md border-none">
          <CardHeader className="border-b border-neutral-200 pb-4">
            <CardTitle className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <Filter className="h-5 w-5 text-emerald-800" />
              Filter Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Crop Type</Label>
                <Select value={cropType} onValueChange={setCropType}>
                  <SelectTrigger className="rounded-none border-2 focus:border-emerald-800 focus:ring-0">
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    {CROP_TYPES.map((crop) => (
                      <SelectItem key={crop} value={crop} className="rounded-none">
                        {crop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>District</Label>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger className="rounded-none border-2 focus:border-emerald-800 focus:ring-0">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none max-h-48">
                    {DISTRICTS.map((d) => (
                      <SelectItem key={d} value={d} className="rounded-none">
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommendations Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
        </div>
      ) : recommendations.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="No Recommendations Found"
          description="No certified seed varieties found for the selected criteria. Try changing the crop type or district."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => (
            <SeedRecommendationCard key={rec.id} recommendation={rec} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
