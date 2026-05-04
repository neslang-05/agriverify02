-- Add columns to product_complaints
ALTER TABLE product_complaints
  ADD COLUMN IF NOT EXISTS assigned_officer_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS investigation_notes TEXT;

-- Officers can update complaints assigned to them
CREATE POLICY "Officers can update assigned complaints" ON product_complaints FOR UPDATE
  USING (assigned_officer_id = auth.uid());

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  actor_role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(100),
  target_id VARCHAR(255),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Service can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (actor_id = auth.uid());

-- Note: 'admin' is a valid value for profiles.role alongside 'farmer' and 'officer'.
-- Admin accounts are created by existing admins only (not via self-registration).
