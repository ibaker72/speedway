-- Add Autofunds import tracking columns to the inventory table
ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS source      TEXT NOT NULL DEFAULT 'autofunds',
  ADD COLUMN IF NOT EXISTS status      TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS raw_data    JSONB;

-- Backfill status from is_sold for existing rows
UPDATE inventory SET status = CASE WHEN is_sold THEN 'inactive' ELSE 'active' END
WHERE status = 'active';

-- Indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_inventory_source      ON inventory(source);
CREATE INDEX IF NOT EXISTS idx_inventory_status      ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_last_seen   ON inventory(last_seen_at DESC);

-- Trigger to keep updated_at current (rename date_modified → updated_at alias via trigger)
-- We use the existing date_modified column for this; no rename needed.

-- Drop and recreate search trigger to include new columns
CREATE OR REPLACE FUNCTION inventory_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.make, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.model, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.trim, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
