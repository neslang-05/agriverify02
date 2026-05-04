'use server';

import { AnalyticsData, DailyTrend, FlaggedBrand, DistrictData } from '@/types';
import { DISTRICTS } from '@/types';
import { createClient } from '@/lib/supabase/server';

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

  const supabase = await createClient();

  // 1. Fetch profiles and verifications separately to avoid join errors
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('id, district');

  if (pError) {
    console.error('Error fetching profiles:', pError);
    throw pError;
  }

  let vhQuery = supabase.from('verification_history').select('*');

  if (district) {
    const districtUserIds = profiles
      .filter(p => p.district === district)
      .map(p => p.id);
    
    if (districtUserIds.length === 0) {
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
    vhQuery = vhQuery.in('user_id', districtUserIds);
  }

  if (dateRange) {
    vhQuery = vhQuery
      .gte('created_at', dateRange.from.toISOString())
      .lte('created_at', dateRange.to.toISOString());
  }

  const { data: verificationsRaw, error: vhError } = await vhQuery;

  if (vhError) {
    console.error('Error fetching verification history:', vhError);
    throw vhError;
  }

  // Join verifications with profile district in JS
  const profileMap = new Map(profiles.map(p => [p.id, p.district]));
  const verifications = verificationsRaw.map(v => ({
    ...v,
    profiles: { district: profileMap.get(v.user_id) }
  }));

  const genuineCount = verifications.filter((v: any) => v.status === 'genuine').length;
  const suspiciousCount = verifications.filter((v: any) => v.status === 'suspicious').length;
  const fakeCount = verifications.filter((v: any) => v.status === 'fake').length;

  // 2. Daily Trend (last 30 days or based on dateRange)
  const dailyTrendMap: Record<string, DailyTrend> = {};
  
  // Initialize last 30 days if no dateRange
  if (!dateRange) {
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyTrendMap[dateStr] = { date: dateStr, total: 0, genuine: 0, suspicious: 0, fake: 0 };
    }
  }

  verifications.forEach((v: any) => {
    const dateStr = new Date(v.created_at).toISOString().split('T')[0];
    if (!dailyTrendMap[dateStr]) {
      dailyTrendMap[dateStr] = { date: dateStr, total: 0, genuine: 0, suspicious: 0, fake: 0 };
    }
    dailyTrendMap[dateStr].total++;
    if (v.status === 'genuine') dailyTrendMap[dateStr].genuine++;
    else if (v.status === 'suspicious') dailyTrendMap[dateStr].suspicious++;
    else if (v.status === 'fake') dailyTrendMap[dateStr].fake++;
  });

  const dailyTrend = Object.values(dailyTrendMap).sort((a, b) => a.date.localeCompare(b.date));

  // 3. District Breakdown
  const districtStats: Record<string, DistrictData> = {};
  
  // Initialize districts
  const districtsToInitialize = district ? [district] : DISTRICTS;
  districtsToInitialize.forEach(d => {
    districtStats[d] = {
      district: d,
      total: 0,
      genuine: 0,
      suspicious: 0,
      fake: 0,
      risk_level: 'low'
    };
  });

  verifications.forEach((v: any) => {
    const d = v.profiles?.district;
    if (d && districtStats[d]) {
      districtStats[d].total++;
      if (v.status === 'genuine') districtStats[d].genuine++;
      else if (v.status === 'suspicious') districtStats[d].suspicious++;
      else if (v.status === 'fake') districtStats[d].fake++;
    }
  });

  const districtData = Object.values(districtStats).map(d => {
    const fakeRatio = d.total > 0 ? d.fake / d.total : 0;
    let risk_level: 'low' | 'medium' | 'high' = 'low';
    if (fakeRatio > 0.3) risk_level = 'high';
    else if (fakeRatio > 0.15) risk_level = 'medium';
    
    return { ...d, risk_level };
  });

  // 4. Top Flagged Brands
  let brandsQuery = supabase
    .from('product_complaints')
    .select('brand_name, created_at')
    .order('created_at', { ascending: false });

  if (district) {
    brandsQuery = brandsQuery.eq('district', district);
  }

  const { data: complaints, error: brandsError } = await brandsQuery;

  if (brandsError) {
    console.error('Error fetching complaints for brands:', brandsError);
  }

  const brandStats: Record<string, { count: number; lastDetected: string }> = {};
  (complaints || []).forEach(c => {
    if (!brandStats[c.brand_name]) {
      brandStats[c.brand_name] = { count: 0, lastDetected: c.created_at };
    }
    brandStats[c.brand_name].count++;
  });

  const topFlaggedBrands: FlaggedBrand[] = Object.entries(brandStats)
    .map(([brand_name, stats]) => ({
      brand_name,
      fake_count: stats.count,
      last_detected: stats.lastDetected
    }))
    .sort((a, b) => b.fake_count - a.fake_count)
    .slice(0, 5);

  return {
    totalVerifications: verifications.length,
    genuineCount,
    suspiciousCount,
    fakeCount,
    dailyTrend,
    topFlaggedBrands,
    districtData,
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

  const supabase = await createClient();

  const { data: verifications, error } = await supabase
    .from('verification_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching farmer stats:', error);
    return {
      totalVerifications: 0,
      genuineCount: 0,
      suspiciousCount: 0,
      fakeCount: 0,
      lastVerification: new Date().toISOString(),
      averageConfidence: 0,
    };
  }

  if (!verifications || verifications.length === 0) {
    return {
      totalVerifications: 0,
      genuineCount: 0,
      suspiciousCount: 0,
      fakeCount: 0,
      lastVerification: new Date().toISOString(),
      averageConfidence: 0,
    };
  }

  const totalVerifications = verifications.length;
  const genuineCount = verifications.filter(v => v.status === 'genuine').length;
  const suspiciousCount = verifications.filter(v => v.status === 'suspicious').length;
  const fakeCount = verifications.filter(v => v.status === 'fake').length;
  const lastVerification = verifications[0].created_at;
  
  const sumConfidence = verifications.reduce((acc, v) => acc + (Number(v.confidence) || 0), 0);
  const averageConfidence = Math.round((sumConfidence / totalVerifications) * 100);

  return {
    totalVerifications,
    genuineCount,
    suspiciousCount,
    fakeCount,
    lastVerification,
    averageConfidence,
  };
}
