-- Speedway Inventory table migration
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  stock_number TEXT NOT NULL,
  vin TEXT NOT NULL UNIQUE,
  year INTEGER NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  trim TEXT,
  body_type TEXT NOT NULL,
  condition TEXT NOT NULL DEFAULT 'used',
  price NUMERIC NOT NULL,
  msrp NUMERIC,
  internet_price NUMERIC,
  mileage INTEGER NOT NULL,
  exterior_color TEXT NOT NULL DEFAULT '',
  interior_color TEXT NOT NULL DEFAULT '',
  transmission TEXT NOT NULL DEFAULT 'Automatic',
  drivetrain TEXT NOT NULL DEFAULT 'FWD',
  engine TEXT NOT NULL DEFAULT '',
  fuel_type TEXT NOT NULL DEFAULT 'Gasoline',
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  thumbnail_url TEXT,
  description TEXT,
  features TEXT[] NOT NULL DEFAULT '{}',
  highlights TEXT[],
  is_commercial BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_new_arrival BOOLEAN NOT NULL DEFAULT false,
  is_sold BOOLEAN NOT NULL DEFAULT false,
  date_added TIMESTAMPTZ NOT NULL DEFAULT now(),
  date_modified TIMESTAMPTZ,
  estimated_payment NUMERIC,
  search_vector TSVECTOR
);

-- Unique slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_slug ON inventory(slug);

-- Filter indexes
CREATE INDEX IF NOT EXISTS idx_inventory_make ON inventory(make);
CREATE INDEX IF NOT EXISTS idx_inventory_body_type ON inventory(body_type);
CREATE INDEX IF NOT EXISTS idx_inventory_price ON inventory(price);
CREATE INDEX IF NOT EXISTS idx_inventory_year ON inventory(year);
CREATE INDEX IF NOT EXISTS idx_inventory_is_sold ON inventory(is_sold);
CREATE INDEX IF NOT EXISTS idx_inventory_is_featured ON inventory(is_featured);
CREATE INDEX IF NOT EXISTS idx_inventory_date_added ON inventory(date_added DESC);

-- Full-text search GIN index
CREATE INDEX IF NOT EXISTS idx_inventory_search ON inventory USING GIN(search_vector);

-- Trigger to auto-update search_vector on insert/update
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

DROP TRIGGER IF EXISTS trg_inventory_search ON inventory;
CREATE TRIGGER trg_inventory_search
  BEFORE INSERT OR UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION inventory_search_update();
