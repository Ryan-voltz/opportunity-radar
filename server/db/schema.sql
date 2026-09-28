-- ====================================================================
-- OPPORTUNITY RADAR — PRODUCTION POSTGRESQL DATABASE SCHEMA
-- Designed for high concurrency, non-destructive migrations and fast indexing
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE opportunity_status AS ENUM ('Novo', 'Em Análise', 'Validando', 'Arquivado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE signal_urgency AS ENUM ('Alta', 'Média', 'Normal');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. OPPORTUNITIES TABLE
CREATE TABLE IF NOT EXISTS opportunities (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tagline TEXT NOT NULL,
    category VARCHAR(64) NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    confidence VARCHAR(32) NOT NULL DEFAULT 'Alta',
    potential_mrr VARCHAR(64) NOT NULL,
    effort VARCHAR(64) NOT NULL,
    difficulty VARCHAR(32) NOT NULL DEFAULT 'Média',
    time_to_mvp_days INTEGER NOT NULL,
    
    -- Market & Geo
    market_country VARCHAR(64) NOT NULL,
    market_flag VARCHAR(16) NOT NULL,
    market_country_code VARCHAR(8) NOT NULL,
    market_continent VARCHAR(64) NOT NULL,
    market_currency VARCHAR(8) NOT NULL,
    target_markets TEXT[] NOT NULL DEFAULT '{}',

    -- 6 Radar Intelligence Dimensions
    what_detected TEXT NOT NULL,
    why_important TEXT NOT NULL,
    problem_exists TEXT NOT NULL,
    opportunity_explored TEXT NOT NULL,
    how_monetized TEXT NOT NULL,

    -- Business Specs
    business_model VARCHAR(64) NOT NULL,
    product_type VARCHAR(64) NOT NULL DEFAULT 'SaaS',
    target_audience VARCHAR(16) NOT NULL DEFAULT 'B2B',
    is_ai_related BOOLEAN NOT NULL DEFAULT false,
    is_remote_work BOOLEAN NOT NULL DEFAULT false,
    investment_required VARCHAR(64) NOT NULL DEFAULT 'Bootstrapped (Baixo)',
    
    unserved_niche TEXT,
    competition_level VARCHAR(32) NOT NULL DEFAULT 'Média',
    existing_competitors TEXT[] NOT NULL DEFAULT '{}',
    differentiation_angle TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    tech_stack TEXT[] NOT NULL DEFAULT '{}',

    -- Growth & Velocity
    freshness VARCHAR(64) NOT NULL DEFAULT 'Novo',
    trending_growth VARCHAR(64) NOT NULL,
    sparkline INTEGER[] NOT NULL DEFAULT '{10,20,30,40,50,60,70}',
    date_detected DATE NOT NULL DEFAULT CURRENT_DATE,
    is_saved BOOLEAN NOT NULL DEFAULT false,
    status opportunity_status NOT NULL DEFAULT 'Novo',
    
    -- JSONB for nested AI SWOT and Validation Playbook
    ai_swot JSONB,
    validation_roadmap JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. LIVE SIGNALS TABLE (High ingestion rate)
CREATE TABLE IF NOT EXISTS live_signals (
    id VARCHAR(64) PRIMARY KEY,
    source VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT NOT NULL,
    category VARCHAR(64) NOT NULL,
    urgency signal_urgency NOT NULL DEFAULT 'Normal',
    score_impact INTEGER NOT NULL,
    detected_at VARCHAR(64) NOT NULL,
    geo_scope VARCHAR(64) NOT NULL,
    country_code VARCHAR(8),
    country_flag VARCHAR(16),
    sentiment VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. GEOPOLITICAL NODES (Countries)
CREATE TABLE IF NOT EXISTS country_signals (
    code VARCHAR(8) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    flag VARCHAR(16) NOT NULL,
    continent VARCHAR(64) NOT NULL,
    currency VARCHAR(8) NOT NULL,
    active_signals INTEGER NOT NULL DEFAULT 0,
    momentum VARCHAR(32) NOT NULL,
    growth_rate INTEGER NOT NULL DEFAULT 0,
    top_category VARCHAR(128) NOT NULL,
    arbitrage_index VARCHAR(32) NOT NULL,
    avg_mrr_potential VARCHAR(64) NOT NULL,
    key_trend TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. USER HYPOTHESES (My Lab)
CREATE TABLE IF NOT EXISTS hypotheses (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    opportunity_ref_id VARCHAR(64) REFERENCES opportunities(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Backlog',
    hypothesis_text TEXT NOT NULL,
    success_metric TEXT NOT NULL,
    confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    notes TEXT,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 7. USER ALERTS
CREATE TABLE IF NOT EXISTS user_alerts (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    query_keywords TEXT NOT NULL,
    min_score INTEGER NOT NULL DEFAULT 80,
    channels TEXT[] NOT NULL DEFAULT '{"In-App"}',
    frequency VARCHAR(32) NOT NULL DEFAULT 'Tempo Real',
    is_active BOOLEAN NOT NULL DEFAULT true,
    triggers_count INTEGER NOT NULL DEFAULT 0,
    last_triggered VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PERSONAL TRACKED PROJECTS (My Lab & AI Coach)
CREATE TABLE IF NOT EXISTS personal_projects (
    id VARCHAR(64) PRIMARY KEY,
    opportunity_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    tagline TEXT NOT NULL,
    category VARCHAR(64) NOT NULL,
    score INTEGER NOT NULL,
    financial_metrics JSONB NOT NULL DEFAULT '{}',
    speed_metrics JSONB NOT NULL DEFAULT '{}',
    investment_metrics JSONB NOT NULL DEFAULT '{}',
    tasks JSONB NOT NULL DEFAULT '[]',
    progress_percent INTEGER NOT NULL DEFAULT 0,
    started_at VARCHAR(64) NOT NULL,
    target_completion_date VARCHAR(64) NOT NULL,
    last_checkin_at VARCHAR(64) NOT NULL,
    daily_streak INTEGER NOT NULL DEFAULT 0,
    checked_in_today BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(32) NOT NULL DEFAULT 'em_andamento',
    user_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. MARKET NEWS & INTELLIGENCE
CREATE TABLE IF NOT EXISTS market_news (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    source VARCHAR(64) NOT NULL,
    url TEXT NOT NULL,
    published_at VARCHAR(64) NOT NULL,
    category VARCHAR(64) NOT NULL,
    country_code VARCHAR(8) NOT NULL,
    country_flag VARCHAR(16) NOT NULL,
    impact_score INTEGER NOT NULL,
    is_trending BOOLEAN NOT NULL DEFAULT false,
    tags TEXT[] NOT NULL DEFAULT '{}',
    ai_analysis_summary TEXT NOT NULL,
    ai_question TEXT NOT NULL,
    is_saved BOOLEAN NOT NULL DEFAULT false,
    possible_opportunities JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- STRATEGIC INDEXES (Zero redundant overhead, targeted to common query patterns)
-- ====================================================================

-- Index for ordering by Radar Score (used on Dashboard and default Catalog sort)
CREATE INDEX IF NOT EXISTS idx_opportunities_score ON opportunities (score DESC);

-- Composite index for category filtering sorted by score
CREATE INDEX IF NOT EXISTS idx_opportunities_cat_score ON opportunities (category, score DESC);

-- Index for Geopolitical node filtering
CREATE INDEX IF NOT EXISTS idx_opportunities_country ON opportunities (market_country_code);

-- Index for Saved Opportunities pipeline
CREATE INDEX IF NOT EXISTS idx_opportunities_saved ON opportunities (is_saved) WHERE is_saved = true;

-- Full-Text Search GIN index for blazing fast text queries on title + what_detected + problem
CREATE INDEX IF NOT EXISTS idx_opportunities_fts ON opportunities USING GIN (
    to_tsvector('simple', title || ' ' || what_detected || ' ' || problem_exists || ' ' || opportunity_explored)
);

-- Index on live signals for fast feed sorting by detection
CREATE INDEX IF NOT EXISTS idx_signals_created ON live_signals (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_source ON live_signals (source);
