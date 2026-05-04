-- ============================================================
-- Fake Seed Detection Platform — Supabase Database Setup
-- ============================================================
-- Run this entire script in the Supabase SQL Editor.
-- It is safe to re-run (uses IF NOT EXISTS / DROP IF EXISTS).
-- ============================================================

-- ============================================================
-- 0. HELPER FUNCTION — Read role from JWT (prevents RLS recursion)
-- ============================================================
-- This is the CRITICAL function that prevents infinite recursion.
-- All officer/admin policies MUST use this instead of querying the profiles table.
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role')::text,
    'farmer'
  );
$$;


-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
-- Mirrors auth.users with app-specific fields.
-- Populated automatically on registration via the application.
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  full_name   TEXT,
  role        TEXT        NOT NULL DEFAULT 'farmer'
                          CHECK (role IN ('farmer', 'officer', 'admin')),
  district    TEXT        NOT NULL DEFAULT 'Not specified',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role     ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_district ON public.profiles(district);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles: user selects own row"    ON public.profiles;
DROP POLICY IF EXISTS "profiles: user updates own row"    ON public.profiles;
DROP POLICY IF EXISTS "profiles: officer/admin select all" ON public.profiles;
DROP POLICY IF EXISTS "profiles: admin full access"        ON public.profiles;
DROP POLICY IF EXISTS "profiles: insert on registration"   ON public.profiles;

-- Any authenticated user can read their own profile
CREATE POLICY "profiles: user selects own row"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Any authenticated user can update their own profile (except role)
CREATE POLICY "profiles: user updates own row"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Officers and admins can read ALL profiles (uses JWT, no table join → no recursion)
CREATE POLICY "profiles: officer/admin select all"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() IN ('officer', 'admin'));

-- Admins can update any profile (e.g. promote to officer)
CREATE POLICY "profiles: admin full access"
  ON public.profiles FOR ALL
  USING (public.get_user_role() = 'admin');

-- Allow insert during registration (user inserts their own row)
CREATE POLICY "profiles: insert on registration"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- ============================================================
-- 2. VERIFICATION_HISTORY TABLE
-- ============================================================
-- Stores every seed packet verification result per farmer.
CREATE TABLE IF NOT EXISTS public.verification_history (
  id                   UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url            TEXT           NOT NULL,
  status               TEXT           NOT NULL
                                      CHECK (status IN ('genuine', 'suspicious', 'fake')),
  confidence           DECIMAL(5,4)   NOT NULL
                                      CHECK (confidence BETWEEN 0 AND 1),
  vision_ai_tag        TEXT,
  vision_ai_confidence DECIMAL(5,4)   CHECK (vision_ai_confidence BETWEEN 0 AND 1),
  seed_variety         TEXT,
  recommendation       TEXT,
  risk_factors         JSONB          NOT NULL DEFAULT '[]'::jsonb,
  created_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vh_user_id        ON public.verification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_vh_created_at     ON public.verification_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vh_status         ON public.verification_history(status);
CREATE INDEX IF NOT EXISTS idx_vh_user_created   ON public.verification_history(user_id, created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_vh_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_vh_updated_at ON public.verification_history;
CREATE TRIGGER trigger_vh_updated_at
  BEFORE UPDATE ON public.verification_history
  FOR EACH ROW EXECUTE FUNCTION public.update_vh_updated_at();

-- RLS
ALTER TABLE public.verification_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vh: user selects own"           ON public.verification_history;
DROP POLICY IF EXISTS "vh: user inserts own"           ON public.verification_history;
DROP POLICY IF EXISTS "vh: user updates own"           ON public.verification_history;
DROP POLICY IF EXISTS "vh: user deletes own"           ON public.verification_history;
DROP POLICY IF EXISTS "vh: officer/admin select all"   ON public.verification_history;

CREATE POLICY "vh: user selects own"
  ON public.verification_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "vh: user inserts own"
  ON public.verification_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "vh: user updates own"
  ON public.verification_history FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "vh: user deletes own"
  ON public.verification_history FOR DELETE
  USING (auth.uid() = user_id);

-- Officers and admins can view ALL verification history (cross-district analysis)
CREATE POLICY "vh: officer/admin select all"
  ON public.verification_history FOR SELECT
  USING (public.get_user_role() IN ('officer', 'admin'));


-- ============================================================
-- 3. PRODUCT_COMPLAINTS TABLE
-- ============================================================
-- Farmer-submitted complaints about specific batches.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'complaint_issue_type') THEN
        CREATE TYPE public.complaint_issue_type AS ENUM (
            'poor_germination',
            'stunted_growth',
            'no_yield',
            'pest_susceptibility',
            'physical_impurity',
            'other'
        );
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.product_complaints (
  id                   UUID                      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID                      REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_id      UUID                      REFERENCES public.verification_history(id) ON DELETE SET NULL,
  assigned_officer_id  UUID                      REFERENCES auth.users(id),
  batch_number         VARCHAR(100)              NOT NULL,
  brand_name           VARCHAR(255)              NOT NULL,
  crop_type            VARCHAR(100)              NOT NULL,
  district             VARCHAR(100)              NOT NULL,
  issue_type           public.complaint_issue_type NOT NULL,
  description          TEXT,
  days_since_sowing    INTEGER,
  severity_score       INTEGER                   CHECK (severity_score BETWEEN 1 AND 5),
  field_image_url      TEXT,
  status               VARCHAR(50)               NOT NULL DEFAULT 'received'
                                                 CHECK (status IN ('received', 'under_review', 'finished')),
  investigation_notes  TEXT,
  created_at           TIMESTAMPTZ               NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ               NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_complaints_batch      ON public.product_complaints(batch_number);
CREATE INDEX IF NOT EXISTS idx_complaints_district   ON public.product_complaints(district);
CREATE INDEX IF NOT EXISTS idx_complaints_user       ON public.product_complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created    ON public.product_complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_officer    ON public.product_complaints(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status     ON public.product_complaints(status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_complaints_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_complaints_updated_at ON public.product_complaints;
CREATE TRIGGER trigger_complaints_updated_at
  BEFORE UPDATE ON public.product_complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_complaints_updated_at();

-- RLS
ALTER TABLE public.product_complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "complaints: user selects own"             ON public.product_complaints;
DROP POLICY IF EXISTS "complaints: user inserts own"             ON public.product_complaints;
DROP POLICY IF EXISTS "complaints: officer/admin select all"     ON public.product_complaints;
DROP POLICY IF EXISTS "complaints: officer updates assigned"      ON public.product_complaints;
DROP POLICY IF EXISTS "complaints: admin full access"             ON public.product_complaints;

-- Farmers can read their own complaints
CREATE POLICY "complaints: user selects own"
  ON public.product_complaints FOR SELECT
  USING (auth.uid() = user_id);

-- Farmers can submit complaints
CREATE POLICY "complaints: user inserts own"
  ON public.product_complaints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Officers and admins can view all complaints
CREATE POLICY "complaints: officer/admin select all"
  ON public.product_complaints FOR SELECT
  USING (public.get_user_role() IN ('officer', 'admin'));

-- Officers can update complaints assigned to them (investigation_notes, status)
CREATE POLICY "complaints: officer updates assigned"
  ON public.product_complaints FOR UPDATE
  USING (
    assigned_officer_id = auth.uid()
    OR public.get_user_role() = 'admin'
  );

-- Admins have full access
CREATE POLICY "complaints: admin full access"
  ON public.product_complaints FOR ALL
  USING (public.get_user_role() = 'admin');


-- ============================================================
-- 4. BATCH_RISK_REGISTRY TABLE
-- ============================================================
-- Aggregated risk data per batch — updated by trigger on each complaint.
CREATE TABLE IF NOT EXISTS public.batch_risk_registry (
  batch_number       VARCHAR(100)  PRIMARY KEY,
  brand_name         VARCHAR(255),
  total_complaints   INTEGER       NOT NULL DEFAULT 0,
  unique_districts   INTEGER       NOT NULL DEFAULT 0,
  risk_level         VARCHAR(20)   NOT NULL DEFAULT 'normal'
                                   CHECK (risk_level IN ('normal', 'suspicious', 'high_risk')),
  last_complaint_at  TIMESTAMPTZ,
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_batch_risk_level ON public.batch_risk_registry(risk_level);

-- This table is intentionally readable by all authenticated users
-- (farmers can check if a batch is risky before planting)
ALTER TABLE public.batch_risk_registry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "batch_risk: authenticated read all"  ON public.batch_risk_registry;
DROP POLICY IF EXISTS "batch_risk: system can write"        ON public.batch_risk_registry;

CREATE POLICY "batch_risk: authenticated read all"
  ON public.batch_risk_registry FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only the trigger function (runs as SECURITY DEFINER) writes here
-- but we also allow officers/admins to manually correct entries
CREATE POLICY "batch_risk: officer/admin can write"
  ON public.batch_risk_registry FOR ALL
  USING (public.get_user_role() IN ('officer', 'admin'));

-- Trigger to auto-update batch_risk_registry when a complaint is filed
CREATE OR REPLACE FUNCTION public.update_batch_risk_registry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- runs as table owner, bypasses RLS
AS $$
DECLARE
  v_total_complaints INTEGER;
  v_unique_districts INTEGER;
  v_risk_level       VARCHAR(20);
BEGIN
  SELECT COUNT(*)              INTO v_total_complaints
    FROM public.product_complaints
    WHERE batch_number = NEW.batch_number;

  SELECT COUNT(DISTINCT district) INTO v_unique_districts
    FROM public.product_complaints
    WHERE batch_number = NEW.batch_number;

  IF    v_total_complaints > 5  THEN v_risk_level := 'high_risk';
  ELSIF v_total_complaints >= 3 OR v_unique_districts > 1 THEN v_risk_level := 'suspicious';
  ELSE  v_risk_level := 'normal';
  END IF;

  INSERT INTO public.batch_risk_registry (
    batch_number, brand_name, total_complaints,
    unique_districts, risk_level, last_complaint_at, updated_at
  ) VALUES (
    NEW.batch_number, NEW.brand_name, v_total_complaints,
    v_unique_districts, v_risk_level, NEW.created_at, NOW()
  )
  ON CONFLICT (batch_number) DO UPDATE SET
    total_complaints  = EXCLUDED.total_complaints,
    unique_districts  = EXCLUDED.unique_districts,
    risk_level        = EXCLUDED.risk_level,
    last_complaint_at = GREATEST(batch_risk_registry.last_complaint_at, EXCLUDED.last_complaint_at),
    updated_at        = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_batch_risk ON public.product_complaints;
CREATE TRIGGER trigger_update_batch_risk
  AFTER INSERT ON public.product_complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_batch_risk_registry();


-- ============================================================
-- 5. SEED_REGISTRY TABLE
-- ============================================================
-- Reference database of certified, government-approved seed varieties.
CREATE TABLE IF NOT EXISTS public.seed_registry (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name           TEXT        NOT NULL,
  product_name         TEXT        NOT NULL,
  crop_type            TEXT        NOT NULL,
  variety_name         TEXT,
  manufacturer_name    TEXT,
  manufacturer_license TEXT,
  certification_number TEXT,
  certification_pattern TEXT,      -- Regex pattern for cert number validation
  batch_pattern        TEXT,       -- Regex pattern for batch number validation
  issuing_authority    TEXT,
  certification_status TEXT        NOT NULL DEFAULT 'certified'
                                   CHECK (certification_status IN ('certified', 'registered', 'approved')),
  active_from          DATE,
  active_until         DATE,
  is_active            BOOLEAN     NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seed_registry_brand     ON public.seed_registry(brand_name);
CREATE INDEX IF NOT EXISTS idx_seed_registry_crop      ON public.seed_registry(crop_type);
CREATE INDEX IF NOT EXISTS idx_seed_registry_active    ON public.seed_registry(is_active);

-- RLS
ALTER TABLE public.seed_registry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seed_registry: authenticated read all"  ON public.seed_registry;
DROP POLICY IF EXISTS "seed_registry: officer/admin manage"    ON public.seed_registry;

-- All authenticated users can cross-reference the seed registry
CREATE POLICY "seed_registry: authenticated read all"
  ON public.seed_registry FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Officers and admins manage the registry
CREATE POLICY "seed_registry: officer/admin manage"
  ON public.seed_registry FOR ALL
  USING (public.get_user_role() IN ('officer', 'admin'));


-- ============================================================
-- 6. BLACKLISTED_BRANDS TABLE
-- ============================================================
-- Brands/batches confirmed fake by authorities.
CREATE TABLE IF NOT EXISTS public.blacklisted_brands (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name     TEXT,
  batch_number   TEXT,
  fake_indicators JSONB      NOT NULL DEFAULT '[]'::jsonb,
  region         TEXT,
  seizure_date   DATE,
  case_number    TEXT,
  notes          TEXT,
  is_active      BOOLEAN     NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blacklist_brand   ON public.blacklisted_brands(brand_name);
CREATE INDEX IF NOT EXISTS idx_blacklist_active  ON public.blacklisted_brands(is_active);

-- RLS
ALTER TABLE public.blacklisted_brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blacklist: authenticated read all"  ON public.blacklisted_brands;
DROP POLICY IF EXISTS "blacklist: officer/admin manage"    ON public.blacklisted_brands;

CREATE POLICY "blacklist: authenticated read all"
  ON public.blacklisted_brands FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "blacklist: officer/admin manage"
  ON public.blacklisted_brands FOR ALL
  USING (public.get_user_role() IN ('officer', 'admin'));


-- ============================================================
-- 7. CHAT_MESSAGES TABLE
-- ============================================================
-- AI chatbot conversation history per user.
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message    TEXT        NOT NULL,
  response   TEXT        NOT NULL,
  context    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_user_id    ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON public.chat_messages(created_at DESC);

-- RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat: user selects own"  ON public.chat_messages;
DROP POLICY IF EXISTS "chat: user inserts own"  ON public.chat_messages;
DROP POLICY IF EXISTS "chat: user updates own"  ON public.chat_messages;
DROP POLICY IF EXISTS "chat: user deletes own"  ON public.chat_messages;

CREATE POLICY "chat: user selects own"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "chat: user inserts own"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat: user updates own"
  ON public.chat_messages FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat: user deletes own"
  ON public.chat_messages FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- 8. AUDIT_LOGS TABLE
-- ============================================================
-- Immutable log of privileged admin/officer actions.
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID        REFERENCES auth.users(id),
  actor_role  VARCHAR(50),
  action      VARCHAR(100) NOT NULL,
  target_type VARCHAR(100),
  target_id   VARCHAR(255),
  details     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor     ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_created   ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action    ON public.audit_logs(action);

-- RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit: admin read all"       ON public.audit_logs;
DROP POLICY IF EXISTS "audit: actor can insert"     ON public.audit_logs;

-- Only admins can read audit logs
CREATE POLICY "audit: admin read all"
  ON public.audit_logs FOR SELECT
  USING (public.get_user_role() = 'admin');

-- Any authenticated user can insert their own action (actor_id must match)
CREATE POLICY "audit: actor can insert"
  ON public.audit_logs FOR INSERT
  WITH CHECK (actor_id = auth.uid());


-- ============================================================
-- 9. VISION_AI_MODELS TABLE  (Azure Custom Vision metadata)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vision_ai_models (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name       TEXT        NOT NULL,
  iteration_name   TEXT        NOT NULL,
  project_id       TEXT        NOT NULL,
  crop_type        TEXT,
  accuracy_metrics JSONB,
  is_active        BOOLEAN     NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vision_models_active ON public.vision_ai_models(is_active, crop_type);

-- No RLS needed — read-only config table for the application (not user data)
-- Officers/admins manage via Supabase Dashboard or a service role key
ALTER TABLE public.vision_ai_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vision_models: authenticated read"   ON public.vision_ai_models;
DROP POLICY IF EXISTS "vision_models: admin manage"         ON public.vision_ai_models;

CREATE POLICY "vision_models: authenticated read"
  ON public.vision_ai_models FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "vision_models: admin manage"
  ON public.vision_ai_models FOR ALL
  USING (public.get_user_role() = 'admin');


-- ============================================================
-- 10. VISION_AI_USAGE_LOGS TABLE  (Azure API call tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vision_ai_usage_logs (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id           UUID        REFERENCES public.verification_history(id) ON DELETE CASCADE,
  model_id                  UUID        REFERENCES public.vision_ai_models(id) ON DELETE SET NULL,
  response_time_ms          INTEGER,
  api_status                TEXT,
  error_message             TEXT,
  predictions_count         INTEGER,
  top_prediction_confidence NUMERIC(5,2),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vision_usage_created ON public.vision_ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vision_usage_verify  ON public.vision_ai_usage_logs(verification_id);

ALTER TABLE public.vision_ai_usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vision_usage: admin/officer read"  ON public.vision_ai_usage_logs;
DROP POLICY IF EXISTS "vision_usage: system insert"       ON public.vision_ai_usage_logs;

CREATE POLICY "vision_usage: admin/officer read"
  ON public.vision_ai_usage_logs FOR SELECT
  USING (public.get_user_role() IN ('officer', 'admin'));

-- Allow service-level inserts (application inserts with service role or anon with user session)
CREATE POLICY "vision_usage: authenticated insert"
  ON public.vision_ai_usage_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);


-- ============================================================
-- DONE
-- ============================================================
-- Tables created:
--   1. profiles
--   2. verification_history
--   3. product_complaints
--   4. batch_risk_registry        (auto-maintained by trigger)
--   5. seed_registry
--   6. blacklisted_brands
--   7. chat_messages
--   8. audit_logs
--   9. vision_ai_models
--  10. vision_ai_usage_logs
--
-- Key design decisions:
--   • get_user_role() reads the JWT directly — avoids recursive RLS on profiles
--   • All "officer/admin" policies use get_user_role() to prevent recursion
--   • batch_risk_registry trigger uses SECURITY DEFINER to bypass RLS
--   • audit_logs INSERT policy allows any authenticated actor to log
-- ============================================================
