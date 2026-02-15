ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS google_synced_at TIMESTAMPTZ;
