-- Create cases table
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  case_number TEXT,
  title TEXT NOT NULL,
  case_type TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  description TEXT,
  court_name TEXT,
  judge_name TEXT,
  opposing_party TEXT,
  opposing_counsel TEXT,
  date_opened DATE DEFAULT CURRENT_DATE,
  date_closed DATE,
  statute_of_limitations DATE,
  drive_folder_id TEXT,
  dropbox_folder_path TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_client_id ON cases(client_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_cases_date_opened ON cases(date_opened);

-- Enable RLS
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only CRUD their own cases
CREATE POLICY "Users can view own cases" ON cases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cases" ON cases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cases" ON cases
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cases" ON cases
  FOR DELETE USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE TRIGGER cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
