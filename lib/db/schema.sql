CREATE TABLE IF NOT EXISTS zip_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zip_code VARCHAR(10) NOT NULL,
  signal_type VARCHAR(50) NOT NULL,
  signal_score INTEGER NOT NULL CHECK (signal_score BETWEEN 0 AND 100),
  permit_volume_score       INTEGER CHECK (permit_volume_score BETWEEN 0 AND 100),
  permit_value_score        INTEGER CHECK (permit_value_score BETWEEN 0 AND 100),
  permit_type_score         INTEGER CHECK (permit_type_score BETWEEN 0 AND 100),
  permit_momentum_score     INTEGER CHECK (permit_momentum_score BETWEEN 0 AND 100),
  vacancy_level_score       INTEGER CHECK (vacancy_level_score BETWEEN 0 AND 100),
  vacancy_direction_score   INTEGER CHECK (vacancy_direction_score BETWEEN 0 AND 100),
  vacancy_duration_score    INTEGER CHECK (vacancy_duration_score BETWEEN 0 AND 100),
  lease_density_score       INTEGER CHECK (lease_density_score BETWEEN 0 AND 100),
  lease_sqft_score          INTEGER CHECK (lease_sqft_score BETWEEN 0 AND 100),
  lease_timing_score        INTEGER CHECK (lease_timing_score BETWEEN 0 AND 100),
  ai_confidence_score       INTEGER CHECK (ai_confidence_score BETWEEN 0 AND 100),
  data_completeness         DECIMAL(4,3) CHECK (data_completeness BETWEEN 0 AND 1),
  raw_value DECIMAL(10,2),
  pct_change_30d DECIMAL(6,2),
  pct_change_90d DECIMAL(6,2),
  ai_interpretation TEXT,
  ai_score_rationale TEXT,
  data_snapshot JSONB,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_zip_signals_unique_daily
  ON zip_signals(zip_code, signal_type, (recorded_at::date));

CREATE TABLE IF NOT EXISTS permit_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zip_code VARCHAR(10) NOT NULL,
  city VARCHAR(50),
  permit_type VARCHAR(100),
  address TEXT,
  estimated_value DECIMAL(12,2),
  filing_date DATE,
  contractor_name TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lease_expirations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zip_code VARCHAR(10),
  company_name TEXT,
  ticker VARCHAR(10),
  expiration_quarter VARCHAR(10),
  sq_footage INTEGER,
  address TEXT,
  source_doc TEXT,
  ai_confidence DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  label TEXT,
  alert_threshold INTEGER DEFAULT 65 CHECK (alert_threshold BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, zip_code)
);

CREATE TABLE IF NOT EXISTS ai_market_narratives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zip_code VARCHAR(10) NOT NULL,
  narrative TEXT NOT NULL,
  signal_context JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zip_signals_zip_date ON zip_signals(zip_code, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_permit_filings_zip_date ON permit_filings(zip_code, filing_date DESC);
CREATE INDEX IF NOT EXISTS idx_lease_expirations_zip ON lease_expirations(zip_code);
CREATE INDEX IF NOT EXISTS idx_user_watchlists_user ON user_watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_narratives_zip ON ai_market_narratives(zip_code, generated_at DESC);
