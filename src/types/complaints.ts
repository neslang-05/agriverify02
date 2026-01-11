export type ComplaintIssueType = 
  | 'poor_germination' 
  | 'stunted_growth' 
  | 'no_yield' 
  | 'pest_susceptibility' 
  | 'physical_impurity'
  | 'other';

export type ComplaintStatus = 'open' | 'investigating' | 'resolved';
export type RiskLevel = 'normal' | 'suspicious' | 'high_risk';

export interface ProductComplaint {
  id: string;
  user_id: string;
  verification_id?: string;
  batch_number: string;
  brand_name: string;
  crop_type: string;
  district: string;
  issue_type: ComplaintIssueType;
  description?: string;
  days_since_sowing?: number;
  severity_score?: number;
  field_image_url?: string;
  status: ComplaintStatus;
  created_at: string;
  updated_at: string;
}

export interface BatchRiskRegistry {
  batch_number: string;
  brand_name?: string;
  total_complaints: number;
  unique_districts: number;
  risk_level: RiskLevel;
  last_complaint_at?: string;
  updated_at: string;
}

export interface ComplaintSubmission {
  batchNumber: string;
  brandName: string;
  cropType: string;
  district: string;
  issueType: ComplaintIssueType;
  description?: string;
  daysSinceSowing?: number;
  severityScore?: number;
  verificationId?: string;
  fieldImageUrl?: string;
}

export interface ComplaintTrendData {
  date: string;
  count: number;
  poorGermination: number;
  stuntedGrowth: number;
  noYield: number;
  pestSusceptibility: number;
  physicalImpurity: number;
  other: number;
}
