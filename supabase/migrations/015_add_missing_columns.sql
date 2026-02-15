-- ============================================================
-- Add missing columns discovered during security audit
-- ============================================================

-- 1. timer_started_at on time_entries (used by start/stop timer feature)
ALTER TABLE time_entries
ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMPTZ;

-- 2. sent_at on invoices (used when marking invoice as "sent")
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
