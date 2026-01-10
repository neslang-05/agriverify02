-- Add Azure Vision AI related columns to products table
-- Migration: Add Vision AI Fields
-- Created: 2026-01-09

-- Add Vision AI columns if products table exists
DO $$ 
BEGIN
    -- Check if products table exists before altering
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        -- Add vision_ai_tag column
        IF NOT EXISTS (SELECT FROM pg_attribute 
                      WHERE attrelid = 'public.products'::regclass 
                      AND attname = 'vision_ai_tag' 
                      AND NOT attisdropped) THEN
            ALTER TABLE products ADD COLUMN vision_ai_tag TEXT;
        END IF;

        -- Add vision_ai_confidence column
        IF NOT EXISTS (SELECT FROM pg_attribute 
                      WHERE attrelid = 'public.products'::regclass 
                      AND attname = 'vision_ai_confidence' 
                      AND NOT attisdropped) THEN
            ALTER TABLE products ADD COLUMN vision_ai_confidence NUMERIC(5,2);
        END IF;

        -- Add seed_variety column
        IF NOT EXISTS (SELECT FROM pg_attribute 
                      WHERE attrelid = 'public.products'::regclass 
                      AND attname = 'seed_variety' 
                      AND NOT attisdropped) THEN
            ALTER TABLE products ADD COLUMN seed_variety TEXT;
        END IF;

        -- Add vision_ai_predictions JSONB column
        IF NOT EXISTS (SELECT FROM pg_attribute 
                      WHERE attrelid = 'public.products'::regclass 
                      AND attname = 'vision_ai_predictions' 
                      AND NOT attisdropped) THEN
            ALTER TABLE products ADD COLUMN vision_ai_predictions JSONB;
        END IF;

        -- Add brand_name column if not exists
        IF NOT EXISTS (SELECT FROM pg_attribute 
                      WHERE attrelid = 'public.products'::regclass 
                      AND attname = 'brand_name' 
                      AND NOT attisdropped) THEN
            ALTER TABLE products ADD COLUMN brand_name TEXT;
        END IF;

        -- Add certification_number column if not exists
        IF NOT EXISTS (SELECT FROM pg_attribute 
                      WHERE attrelid = 'public.products'::regclass 
                      AND attname = 'certification_number' 
                      AND NOT attisdropped) THEN
            ALTER TABLE products ADD COLUMN certification_number TEXT;
        END IF;
    END IF;
END $$;

-- Add indexes for vision AI tag searches
CREATE INDEX IF NOT EXISTS idx_products_vision_tag ON products(vision_ai_tag);
CREATE INDEX IF NOT EXISTS idx_products_seed_variety ON products(seed_variety);
CREATE INDEX IF NOT EXISTS idx_products_brand_name ON products(brand_name);

-- Update verification_logs table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'verification_logs') THEN
        -- Add vision_ai_used column
        IF NOT EXISTS (SELECT FROM pg_attribute 
                      WHERE attrelid = 'public.verification_logs'::regclass 
                      AND attname = 'vision_ai_used' 
                      AND NOT attisdropped) THEN
            ALTER TABLE verification_logs ADD COLUMN vision_ai_used BOOLEAN DEFAULT false;
        END IF;

        -- Add vision_ai_confidence column
        IF NOT EXISTS (SELECT FROM pg_attribute 
                      WHERE attrelid = 'public.verification_logs'::regclass 
                      AND attname = 'vision_ai_confidence' 
                      AND NOT attisdropped) THEN
            ALTER TABLE verification_logs ADD COLUMN vision_ai_confidence NUMERIC(5,2);
        END IF;
    END IF;
END $$;

-- Create table for Vision AI model metadata
CREATE TABLE IF NOT EXISTS vision_ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL,
  iteration_name TEXT NOT NULL,
  project_id TEXT NOT NULL,
  crop_type TEXT,
  accuracy_metrics JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for active models
CREATE INDEX IF NOT EXISTS idx_vision_ai_models_active ON vision_ai_models(is_active, crop_type);

-- Create table for tracking Vision AI API usage and performance
CREATE TABLE IF NOT EXISTS vision_ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  model_id UUID REFERENCES vision_ai_models(id) ON DELETE SET NULL,
  response_time_ms INTEGER,
  api_status TEXT,
  error_message TEXT,
  predictions_count INTEGER,
  top_prediction_confidence NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for usage logs queries
CREATE INDEX IF NOT EXISTS idx_vision_ai_usage_created ON vision_ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vision_ai_usage_product ON vision_ai_usage_logs(product_id);

-- Add comments for documentation
COMMENT ON TABLE vision_ai_models IS 'Stores metadata about Azure Custom Vision models used for seed classification';
COMMENT ON TABLE vision_ai_usage_logs IS 'Tracks Azure Custom Vision API calls for monitoring and analytics';
COMMENT ON COLUMN products.vision_ai_tag IS 'The classification tag returned by Azure Custom Vision';
COMMENT ON COLUMN products.vision_ai_confidence IS 'Confidence score (0-100) from Azure Custom Vision model';
COMMENT ON COLUMN products.seed_variety IS 'Extracted seed variety name from Vision AI classification';
COMMENT ON COLUMN products.vision_ai_predictions IS 'Full JSON array of all predictions from Azure Vision API';
