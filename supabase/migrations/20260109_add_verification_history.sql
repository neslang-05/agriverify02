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
    recommendation TEXT,
    risk_factors JSONB DEFAULT '[]'::jsonb,
    
    -- Indexes for common queries
    CONSTRAINT verification_history_user_id_idx FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_history_user_id ON verification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_history_created_at ON verification_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_history_status ON verification_history(status);
CREATE INDEX IF NOT EXISTS idx_verification_history_user_created ON verification_history(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE verification_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own verification history
CREATE POLICY "Users can view own verification history"
    ON verification_history
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own verification history
CREATE POLICY "Users can insert own verification history"
    ON verification_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only update their own verification history
CREATE POLICY "Users can update own verification history"
    ON verification_history
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can only delete their own verification history
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

CREATE TRIGGER trigger_verification_history_updated_at
    BEFORE UPDATE ON verification_history
    FOR EACH ROW
    EXECUTE FUNCTION update_verification_history_updated_at();

-- Add comments for documentation
COMMENT ON TABLE verification_history IS 'Stores farmer seed quality verification history with AI classification results';
COMMENT ON COLUMN verification_history.id IS 'Primary key UUID';
COMMENT ON COLUMN verification_history.user_id IS 'Reference to the farmer who performed the verification';
COMMENT ON COLUMN verification_history.image_url IS 'URL or path to the uploaded seed image';
COMMENT ON COLUMN verification_history.status IS 'Overall verification status: genuine, fake, or suspicious';
COMMENT ON COLUMN verification_history.confidence IS 'Overall confidence score (0-1)';
COMMENT ON COLUMN verification_history.vision_ai_tag IS 'Azure Custom Vision classification tag (Pure/Negative)';
COMMENT ON COLUMN verification_history.vision_ai_confidence IS 'Azure Custom Vision confidence score (0-1)';
COMMENT ON COLUMN verification_history.seed_variety IS 'Detected seed variety from AI analysis';
COMMENT ON COLUMN verification_history.recommendation IS 'Generated recommendation based on verification results';
COMMENT ON COLUMN verification_history.risk_factors IS 'Array of detected risk factors stored as JSONB';
