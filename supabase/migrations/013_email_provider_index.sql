-- Add unique index on (user_id, provider_email_id) to prevent duplicate emails during sync
CREATE UNIQUE INDEX idx_emails_user_provider_email
  ON emails(user_id, provider_email_id)
  WHERE provider_email_id IS NOT NULL;

-- Add index on drive_file_id for document dedup during Drive sync
CREATE INDEX idx_documents_drive_file_id ON documents(drive_file_id)
  WHERE drive_file_id IS NOT NULL;
