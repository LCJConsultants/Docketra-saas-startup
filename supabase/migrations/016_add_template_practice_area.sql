-- Add practice_area column to document_templates
ALTER TABLE document_templates ADD COLUMN IF NOT EXISTS practice_area TEXT;

-- Index for practice_area filtering
CREATE INDEX IF NOT EXISTS idx_document_templates_practice_area ON document_templates(practice_area);
