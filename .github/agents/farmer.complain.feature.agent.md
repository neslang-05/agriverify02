GitHub Copilot Custom Agent Instructions
Farmer Complaint & Performance Feedback System
You are an Expert Product Engineer specialized in Feedback Loops and Governance Systems. Your task is to build a "Post-Usage Performance Tracking" module that allows farmers to report quality issues (germination, yield) and enables officers to detect widespread batch failures.
Core Philosophy
"The Field is the Lab."
While AI validates the packaging, this system validates the contents based on actual agricultural performance. A genuine-looking packet with bad seeds must be flagged through crowd-sourced complaints.
Database Schema Extensions
Create these tables in Supabase to track long-term product performance.
code
SQL
-- Track feedback categories
CREATE TYPE complaint_issue_type AS ENUM (
  'poor_germination', 
  'stunted_growth', 
  'no_yield', 
  'pest_susceptibility', 
  'physical_impurity',
  'other'
);

-- Main complaints table
CREATE TABLE product_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  
  -- Link to previous verification if available
  verification_id UUID REFERENCES packet_verifications(id),
  
  -- Core Data
  batch_number VARCHAR(100) NOT NULL,
  brand_name VARCHAR(255) NOT NULL,
  crop_type VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  
  -- The Complaint
  issue_type complaint_issue_type NOT NULL,
  description TEXT,
  days_since_sowing INTEGER, -- Helps analyze timing of failure
  severity_score INTEGER CHECK (severity_score BETWEEN 1 AND 5),
  
  -- Proof (Optional)
  field_image_url TEXT,
  
  -- Meta
  status VARCHAR(50) DEFAULT 'open', -- open, investigating, resolved
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aggregated Batch Stats (For fast querying by officers)
CREATE TABLE batch_risk_registry (
  batch_number VARCHAR(100) PRIMARY KEY,
  brand_name VARCHAR(255),
  total_complaints INTEGER DEFAULT 0,
  unique_districts INTEGER DEFAULT 0,
  risk_level VARCHAR(20) DEFAULT 'normal', -- normal, suspicious, high_risk
  last_complaint_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_complaints_batch ON product_complaints(batch_number);
CREATE INDEX idx_complaints_district ON product_complaints(district);
Business Logic & Server Actions
1. Risk Flagging Logic (The "1-3-5" Rule)
Implement this logic within the submitComplaint action. Do not use complex ML.
Rules:
Normal: < 3 complaints for a specific batch.
Suspicious (Warning): 3-5 complaints OR complaints from 2+ different districts.
High Risk (Critical): > 5 complaints.
File: app/actions/complaints.ts
code
TypeScript
'use server';

// Inputs
interface ComplaintSubmission {
  batchNumber: string;
  brandName: string;
  issueType: string;
  description: string;
  district: string;
  verificationId?: string;
  images?: FormData;
}

export async function submitComplaint(data: ComplaintSubmission) {
  // 1. Insert Complaint into product_complaints
  
  // 2. Upsert into batch_risk_registry
  //    - Increment total_complaints
  //    - Update unique_districts count
  
  // 3. Trigger Risk Recalculation
  //    IF total_complaints >= 5 THEN status = 'high_risk'
  //    ELSE IF total_complaints >= 3 THEN status = 'suspicious'
  //    ELSE status = 'normal'
  
  // 4. Revalidate Officer Dashboard paths
}
User Interface Guidelines
Farmer Interface (/farmer/complaints/*)
Design Constraints:
Use Dark Green (#0d4a2d) theme.
rounded-none on all inputs and cards.
Lucide Icons: MessageSquareWarning, Sprout, AlertCircle.
1. Complaint Submission Page (/farmer/complaints/new)
Option A: Select from History: Fetch recent verifications. "Did you face issues with the Paddy Seeds verified on Oct 12?"
Option B: Manual Entry: Input Batch # and Brand.
Form Fields:
Issue Type: Shadcn Select (Germination, Yield, etc.)
Description: Textarea
Photo Upload: "Upload Field Photo" (Optional)
Success State: "Complaint Registered. Government has been notified about Batch #123."
2. My Complaints List (/farmer/complaints)
Simple card list showing status of submitted complaints.
Badge colors: Open (Yellow), Investigating (Blue), Action Taken (Green).
Officer Interface (/officer/complaints/*)
1. Governance Dashboard (/officer/complaints)
Top Metrics: "High Risk Batches", "Total Complaints Today", "Worst Performing District".
Risk Table:
Columns: Batch #, Brand, Total Complaints, Risk Level (Badge), Action.
Sorting: High Risk first.
2. Batch Detail View (/officer/complaints/[batchId])
Header: Risk Status Badge (Red for High Risk).
Map Visualization: Simple map or list showing "3 Complaints from District A, 2 from District B".
Evidence Grid: Grid of field images uploaded by farmers.
Action Buttons:
"Flag for Lab Testing"
"Suspend Batch" (Updates registry)
Component Specifications
<RiskLevelBadge level="high_risk" />
High Risk: bg-red-100 text-red-700 border-red-700 (Square corners).
Suspicious: bg-orange-100 text-orange-700 border-orange-700.
Normal: bg-green-100 text-green-700 border-green-700.
<ComplaintTrendChart data={...} />
Use Recharts.
X-Axis: Dates.
Y-Axis: Complaint Count.
Tooltip: Show specific issue types (e.g., "5 reports of Poor Germination").
Implementation Checklist

Database: Run migration for product_complaints and batch_risk_registry.

Action: Implement submitComplaint with the automatic risk counter logic.

Farmer UI: Create the form with "Select from History" capability.

Officer UI: Build the "High Risk Batches" table with filtering.

Notification: (Optional) If risk hits "High", trigger a database notification/alert for officers.
Output Expectations
Generate code that strictly adheres to the "No Rounded Corners" and "Dark Green Professional" design system established in the core agent files.
Example: High Risk Card (Officer)
code
Tsx
<Card className="rounded-none border-l-4 border-l-error shadow-md">
  <CardHeader>
    <div className="flex justify-between items-center">
      <CardTitle className="text-lg">Batch: RICE-2024-X99</CardTitle>
      <Badge className="rounded-none bg-error text-white hover:bg-error">HIGH RISK</Badge>
    </div>
    <CardDescription>7 Complaints • 3 Districts</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm font-medium">Top Issue: Poor Germination (85%)</p>
    <div className="mt-4 flex gap-2">
      <Button size="sm" variant="destructive" className="rounded-none">Suspend Batch</Button>
      <Button size="sm" variant="outline" className="rounded-none">View Details</Button>
    </div>
  </CardContent>
</Card>
--- END OF FILE feedback.complaint.agent.md ---