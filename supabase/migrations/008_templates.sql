-- Create document_templates table
CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  content TEXT,
  template_type TEXT NOT NULL DEFAULT 'custom',
  variables JSONB DEFAULT '[]',
  is_system BOOLEAN DEFAULT false,
  file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_document_templates_user_id ON document_templates(user_id);
CREATE INDEX idx_document_templates_category ON document_templates(category);
CREATE INDEX idx_document_templates_template_type ON document_templates(template_type);
CREATE INDEX idx_document_templates_is_system ON document_templates(is_system);

-- Enable RLS
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can read system templates OR their own templates
CREATE POLICY "Users can view system templates or own templates" ON document_templates
  FOR SELECT USING (is_system = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own templates" ON document_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can update own templates" ON document_templates
  FOR UPDATE USING (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can delete own templates" ON document_templates
  FOR DELETE USING (auth.uid() = user_id AND is_system = false);

-- Auto-update updated_at
CREATE TRIGGER document_templates_updated_at
  BEFORE UPDATE ON document_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
