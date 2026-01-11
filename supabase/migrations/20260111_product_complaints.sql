-- Create complaint issue type enum
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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Link to previous verification if available
  verification_id UUID REFERENCES packet_verifications(id) ON DELETE SET NULL,
  
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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

-- Indexes for fast querying
CREATE INDEX idx_complaints_batch ON product_complaints(batch_number);
CREATE INDEX idx_complaints_district ON product_complaints(district);
CREATE INDEX idx_complaints_user ON product_complaints(user_id);
CREATE INDEX idx_complaints_created ON product_complaints(created_at DESC);
CREATE INDEX idx_batch_risk_level ON batch_risk_registry(risk_level);

-- Enable RLS for product_complaints
ALTER TABLE product_complaints ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can view their own complaints
CREATE POLICY "Users can view own complaints"
  ON product_complaints FOR SELECT
  USING (auth.uid() = user_id);

-- RLS policy: Officers can view all complaints
CREATE POLICY "Officers can view all complaints"
  ON product_complaints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'officer'
    )
  );

-- RLS policy: Users can insert their own complaints
CREATE POLICY "Users can insert complaints"
  ON product_complaints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS policy: Officers can update complaint status
CREATE POLICY "Officers can update complaint status"
  ON product_complaints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'officer'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'officer'
    )
  );

-- batch_risk_registry doesn't need RLS - it's read-only for users
ALTER TABLE batch_risk_registry DISABLE ROW LEVEL SECURITY;

-- Function to update batch_risk_registry when a complaint is added
CREATE OR REPLACE FUNCTION update_batch_risk_registry()
RETURNS TRIGGER AS $$
DECLARE
  v_total_complaints INTEGER;
  v_unique_districts INTEGER;
  v_risk_level VARCHAR(20);
BEGIN
  -- Count total complaints for this batch
  SELECT COUNT(*) INTO v_total_complaints
  FROM product_complaints
  WHERE batch_number = NEW.batch_number;
  
  -- Count unique districts
  SELECT COUNT(DISTINCT district) INTO v_unique_districts
  FROM product_complaints
  WHERE batch_number = NEW.batch_number;
  
  -- Determine risk level based on the 1-3-5 rule
  IF v_total_complaints > 5 THEN
    v_risk_level := 'high_risk';
  ELSIF v_total_complaints >= 3 OR v_unique_districts > 1 THEN
    v_risk_level := 'suspicious';
  ELSE
    v_risk_level := 'normal';
  END IF;
  
  -- Upsert into batch_risk_registry
  INSERT INTO batch_risk_registry (
    batch_number,
    brand_name,
    total_complaints,
    unique_districts,
    risk_level,
    last_complaint_at,
    updated_at
  ) VALUES (
    NEW.batch_number,
    NEW.brand_name,
    v_total_complaints,
    v_unique_districts,
    v_risk_level,
    NEW.created_at,
    NOW()
  )
  ON CONFLICT (batch_number) DO UPDATE SET
    total_complaints = v_total_complaints,
    unique_districts = v_unique_districts,
    risk_level = v_risk_level,
    last_complaint_at = GREATEST(batch_risk_registry.last_complaint_at, EXCLUDED.last_complaint_at),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update batch_risk_registry
CREATE TRIGGER trigger_update_batch_risk_registry
AFTER INSERT ON product_complaints
FOR EACH ROW
EXECUTE FUNCTION update_batch_risk_registry();
