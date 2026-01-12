-- Migration: Add Verification History Table
-- Description: Stores farmer seed quality verification history with AI results
-- Author: GitHub Copilot
-- Date: 2026-01-09

-- Create verification_history table
CREATE TABLE IF NOT EXISTS verification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Image data
    image_url TEXT NOT NULL,
    
    -- Verification results
    status TEXT NOT NULL CHECK (status IN ('genuine', 'fake', 'suspicious')),
    confidence DECIMAL(5, 4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    
    -- Vision AI results
    vision_ai_tag TEXT,
    vision_ai_confidence DECIMAL(5, 4) CHECK (vision_ai_confidence >= 0 AND vision_ai_confidence <= 1),
    seed_variety TEXT,
    
    -- Additional metadata
    recommendation TEXT
);

-- Add risk_factors column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'verification_history' 
        AND column_name = 'risk_factors'
    ) THEN
        ALTER TABLE verification_history ADD COLUMN risk_factors JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_history_user_id ON verification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_history_created_at ON verification_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_history_status ON verification_history(status);
CREATE INDEX IF NOT EXISTS idx_verification_history_user_created ON verification_history(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE verification_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies (use DROP IF EXISTS to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own verification history" ON verification_history;
CREATE POLICY "Users can view own verification history"
    ON verification_history
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own verification history" ON verification_history;
CREATE POLICY "Users can insert own verification history"
    ON verification_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own verification history" ON verification_history;
CREATE POLICY "Users can update own verification history"
    ON verification_history
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own verification history" ON verification_history;
CREATE POLICY "Users can delete own verification history"
    ON verification_history
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_verification_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_verification_history_updated_at ON verification_history;
CREATE TRIGGER trigger_verification_history_updated_at
    BEFORE UPDATE ON verification_history
    FOR EACH ROW
    EXECUTE FUNCTION update_verification_history_updated_at();
