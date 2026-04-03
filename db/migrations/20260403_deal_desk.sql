-- Speedway Deal Desk schema (for PostgreSQL production migration)
CREATE TABLE IF NOT EXISTS deal_desk_leads (
  id UUID PRIMARY KEY,
  request_type TEXT NOT NULL,
  status TEXT NOT NULL,
  follow_up_priority INTEGER NOT NULL DEFAULT 3,
  assigned_rep TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  preferred_contact_method TEXT NOT NULL,
  customer_message TEXT,
  vehicle_id TEXT NOT NULL,
  vehicle_slug TEXT NOT NULL,
  stock_number TEXT,
  vehicle_title TEXT NOT NULL,
  vehicle_price NUMERIC NOT NULL,
  calculator_snapshot JSONB NOT NULL,
  monthly_estimate_shown NUMERIC NOT NULL,
  out_the_door_estimate_shown NUMERIC NOT NULL,
  engagement_score INTEGER NOT NULL,
  engagement_label TEXT NOT NULL,
  utm JSONB,
  referral_source TEXT,
  session_id TEXT NOT NULL,
  history JSONB NOT NULL,
  notes JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS deal_desk_events (
  id UUID PRIMARY KEY,
  type TEXT NOT NULL,
  lead_id UUID,
  vehicle_id TEXT,
  vehicle_slug TEXT,
  session_id TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_deal_desk_leads_created_at ON deal_desk_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deal_desk_leads_status ON deal_desk_leads(status);
CREATE INDEX IF NOT EXISTS idx_deal_desk_events_session ON deal_desk_events(session_id, created_at DESC);
