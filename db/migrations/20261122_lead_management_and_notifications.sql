-- Lead management (follow-up status, notes, audit trail) and durable
-- sales-team notifications for website leads (`public.leads`).
--
-- Additive and safe to run more than once. Nothing is dropped and no lead is
-- deleted. Existing rows get:
--   * notification_status = 'sent' when notified_at is set, otherwise 'failed'
--     with an explanatory note. 'failed' is never retried automatically:
--     re-sending an old notification needs a staff decision (the admin
--     dashboard's "Send notification" button).
--   * status unchanged (all production rows are 'new' as of 2026-11-22).
--
-- Access model (same as public.leads): the website reads and writes with the
-- service-role key from server code only. RLS is enabled with no policies
-- (deny by default) and the anon/authenticated grants that Supabase's default
-- privileges add to new public tables are revoked.
--
-- Recovery: see docs/leads/lead-notifications-and-dashboard.md → "Migration
-- recovery". The new columns and tables can be ignored by older code; the
-- pre-migration copy of public.leads is kept in a private backup schema.

BEGIN;

-- ── public.leads: notification tracking and follow-up timestamps ──────────
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS notification_status TEXT,
  ADD COLUMN IF NOT EXISTS notification_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notification_next_attempt_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notification_last_attempt_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notification_last_error TEXT,
  ADD COLUMN IF NOT EXISTS notification_message_id TEXT,
  ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

UPDATE public.leads
   SET notification_status = CASE WHEN notified_at IS NOT NULL THEN 'sent' ELSE 'failed' END,
       notification_last_error = CASE
         WHEN notified_at IS NOT NULL THEN NULL
         ELSE 'Not delivered before notification tracking existed (Resend rejected the sender domain). Send it from the dashboard once email works.'
       END
 WHERE notification_status IS NULL;

ALTER TABLE public.leads ALTER COLUMN notification_status SET DEFAULT 'pending';
ALTER TABLE public.leads ALTER COLUMN notification_status SET NOT NULL;

DO $$
BEGIN
  ALTER TABLE public.leads
    ADD CONSTRAINT leads_notification_status_check
    CHECK (notification_status IN ('pending', 'sending', 'sent', 'failed'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  -- Fails (and rolls back everything) if a row has a status outside this list.
  ALTER TABLE public.leads
    ADD CONSTRAINT leads_status_check
    CHECK (status IN ('new', 'contacted', 'in_progress', 'appointment_scheduled', 'sold', 'closed_lost'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- The retry job's queue scan.
CREATE INDEX IF NOT EXISTS idx_leads_notification_due
  ON public.leads (notification_next_attempt_at)
  WHERE notification_status IN ('pending', 'sending');

-- ── Delivery attempts (one row per call to Resend) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.lead_notification_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads (id) ON DELETE CASCADE,
  attempt INTEGER NOT NULL,
  trigger TEXT NOT NULL CHECK (trigger IN ('submit', 'retry', 'manual')),
  outcome TEXT NOT NULL CHECK (outcome IN ('accepted', 'failed')),
  error_code TEXT,
  error_message TEXT,
  provider_message_id TEXT,
  idempotency_key TEXT NOT NULL,
  ambiguous BOOLEAN NOT NULL DEFAULT false,
  -- Filled in by the Resend webhook: delivered, bounced, complained, delayed…
  delivery_status TEXT,
  delivery_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lead_notification_attempts_lead ON public.lead_notification_attempts (lead_id, attempt DESC);
CREATE INDEX IF NOT EXISTS idx_lead_notification_attempts_message
  ON public.lead_notification_attempts (provider_message_id) WHERE provider_message_id IS NOT NULL;

-- ── Staff activity: status changes, notes, manual sends (audit trail) ──────
CREATE TABLE IF NOT EXISTS public.lead_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads (id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('status_change', 'note', 'notification_requested')),
  from_status TEXT,
  to_status TEXT,
  body TEXT,
  actor TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lead_activity_lead ON public.lead_activity (lead_id, created_at DESC);

-- ── Resend webhook deliveries already processed (duplicate protection) ─────
CREATE TABLE IF NOT EXISTS public.resend_webhook_events (
  svix_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  email_id TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Lock down: service role only ───────────────────────────────────────────
ALTER TABLE public.lead_notification_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resend_webhook_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.lead_notification_attempts, public.lead_activity, public.resend_webhook_events FROM PUBLIC;
DO $$
DECLARE r TEXT;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON TABLE public.lead_notification_attempts, public.lead_activity, public.resend_webhook_events FROM %I', r);
    END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.lead_notification_attempts, public.lead_activity, public.resend_webhook_events TO service_role;
  END IF;
END $$;

COMMIT;
