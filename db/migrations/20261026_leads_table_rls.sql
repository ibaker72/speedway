-- Ensure the `leads` table exists in production and lock it down.
--
-- Context: 20260404_leads.sql was never applied to the production project,
-- so every insert from /api/contact, /api/finance, /api/test-drive,
-- /api/trade-in, /api/sell-car, /api/inventory-alerts and
-- /api/shipping-inquiry failed. This migration is idempotent and safe to run
-- whether or not the earlier file was applied.
--
-- Access model: the website writes with the service-role key on the server
-- only. Enabling RLS with no policies blocks the anon/public key entirely,
-- matching inventory, deal_desk_leads, deal_desk_events and geo_landing_pages.

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
