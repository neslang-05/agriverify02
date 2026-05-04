// User types
export type UserRole = 'farmer' | 'officer' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  district: string;
  full_name?: string;
  created_at: string;
}

// Verification types
export type VerificationStatus = 'genuine' | 'suspicious' | 'fake';

export interface Product {
  id: string;
  user_id: string;
  image_url: string;
  brand_name: string;
  detected_text: string;
  verification_status: VerificationStatus;
  confidence: number;
  crop_type: string;
  district: string;
  created_at: string;
}

export interface VerificationResult {
  id: string;
  product_id: string;
  status: VerificationStatus;
  confidence: number;
  detected_text: string;
  risk_explanation: string;
  recommendations: string[];
  verified_at: string;
}

// Seed registry types
export interface SeedRecommendation {
  id: string;
  crop_type: string;
  region: string;
  variety_name: string;
  issuing_authority: string;
  description: string;
  certification_status: 'certified' | 'registered' | 'approved';
}

// Chat types
export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response: string;
  context?: Record<string, unknown>;
  created_at: string;
}

// Analytics types
export interface VerificationLog {
  id: string;
  product_id: string;
  status: VerificationStatus;
  risk_score: number;
  district: string;
  verified_at: string;
}

export interface AnalyticsData {
  totalVerifications: number;
  genuineCount: number;
  suspiciousCount: number;
  fakeCount: number;
  dailyTrend: DailyTrend[];
  topFlaggedBrands: FlaggedBrand[];
  districtData: DistrictData[];
}

export interface DailyTrend {
  date: string;
  total: number;
  genuine: number;
  suspicious: number;
  fake: number;
}

export interface FlaggedBrand {
  brand_name: string;
  fake_count: number;
  last_detected: string;
}

export interface DistrictData {
  district: string;
  total: number;
  genuine: number;
  suspicious: number;
  fake: number;
  risk_level: 'low' | 'medium' | 'high';
}

// Form types
export interface VerificationFormData {
  image: File;
  cropType: string;
  district: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}

// Constants
export const CROP_TYPES = [
  'Rice',
  'Wheat',
  'Cotton',
  'Maize',
  'Soybean',
  'Groundnut',
  'Sugarcane',
  'Mustard',
  'Pulses',
  'Vegetables',
] as const;

export const DISTRICTS = [
  'Hyderabad',
  'Warangal',
  'Karimnagar',
  'Nizamabad',
  'Khammam',
  'Nalgonda',
  'Mahbubnagar',
  'Rangareddy',
  'Medak',
  'Adilabad',
  'Guntur',
  'Krishna',
  'Visakhapatnam',
  'East Godavari',
  'West Godavari',
] as const;

export type CropType = (typeof CROP_TYPES)[number];
export type District = (typeof DISTRICTS)[number];
