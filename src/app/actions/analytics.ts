'use server';

import { AnalyticsData, DailyTrend, FlaggedBrand, DistrictData } from '@/types';
import { DISTRICTS } from '@/types';

function generateMockDailyTrend(): DailyTrend[] {
  const trends: DailyTrend[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const total = Math.floor(Math.random() * 50) + 20;
    const genuine = Math.floor(total * (0.6 + Math.random() * 0.2));
    const fake = Math.floor((total - genuine) * (0.3 + Math.random() * 0.4));
    const suspicious = total - genuine - fake;

    trends.push({
      date: date.toISOString().split('T')[0],
      total,
      genuine,
      suspicious,
      fake,
    });
  }

  return trends;
}

function generateMockFlaggedBrands(): FlaggedBrand[] {
  const brands = [
    'XYZ Seeds Co.',
    'Unknown Agro Products',
    'Cheap Seeds Ltd.',
    'Miracle Grow Fake',
    'Counterfeit Fertilizers',
    'Fake Harvest Inc.',
    'Dubious Seeds',
  ];

  return brands
    .slice(0, 5)
    .map((brand) => ({
      brand_name: brand,
      fake_count: Math.floor(Math.random() * 50) + 10,
      last_detected: new Date(
        Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
      ).toISOString(),
    }))
    .sort((a, b) => b.fake_count - a.fake_count);
}

function generateMockDistrictData(): DistrictData[] {
  return DISTRICTS.map((district) => {
    const total = Math.floor(Math.random() * 200) + 50;
    const genuine = Math.floor(total * (0.5 + Math.random() * 0.3));
    const fake = Math.floor((total - genuine) * (0.2 + Math.random() * 0.5));
    const suspicious = total - genuine - fake;

    const fakeRatio = fake / total;
    let risk_level: 'low' | 'medium' | 'high' = 'low';
    if (fakeRatio > 0.3) risk_level = 'high';
    else if (fakeRatio > 0.15) risk_level = 'medium';

    return {
      district,
      total,
      genuine,
      suspicious,
      fake,
      risk_level,
    };
  });
}

export async function getAnalytics(
  district?: string,
  dateRange?: { from: Date; to: Date }
): Promise<AnalyticsData> {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (isDemoMode) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const dailyTrend = generateMockDailyTrend();
    const topFlaggedBrands = generateMockFlaggedBrands();
    const districtData = generateMockDistrictData();

    const totals = dailyTrend.reduce(
      (acc, day) => ({
        total: acc.total + day.total,
        genuine: acc.genuine + day.genuine,
        suspicious: acc.suspicious + day.suspicious,
        fake: acc.fake + day.fake,
      }),
      { total: 0, genuine: 0, suspicious: 0, fake: 0 }
    );

    return {
      totalVerifications: totals.total,
      genuineCount: totals.genuine,
      suspiciousCount: totals.suspicious,
      fakeCount: totals.fake,
      dailyTrend,
      topFlaggedBrands,
      districtData: district
        ? districtData.filter((d) => d.district === district)
        : districtData,
    };
  }

  // For non-demo mode, return default/empty data for now
  // TODO: Implement real analytics from verification_history table
  return {
    totalVerifications: 0,
    genuineCount: 0,
    suspiciousCount: 0,
    fakeCount: 0,
    dailyTrend: [],
    topFlaggedBrands: [],
    districtData: [],
  };
}

export async function getFarmerStats(userId: string) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (isDemoMode) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      totalVerifications: Math.floor(Math.random() * 20) + 5,
      genuineCount: Math.floor(Math.random() * 15) + 3,
      suspiciousCount: Math.floor(Math.random() * 5),
      fakeCount: Math.floor(Math.random() * 3),
      lastVerification: new Date(
        Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
      ).toISOString(),
      averageConfidence: Math.floor(Math.random() * 20) + 70,
    };
  }

  // For non-demo mode, return default data
  // TODO: Implement real farmer stats from verification_history table
  return {
    totalVerifications: 0,
    genuineCount: 0,
    suspiciousCount: 0,
    fakeCount: 0,
    lastVerification: new Date().toISOString(),
    averageConfidence: 0,
  };
}
