-- ============================================================
-- Fix 1: Storage bucket RLS policies for "documents" bucket
-- Users can only access files within their own user_id folder
-- ============================================================

-- Ensure the documents bucket exists (no-op if already created via dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Users can upload files to their own folder: {user_id}/...
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view/download their own files
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================
-- Fix 2: Add missing DELETE policy on profiles table
-- Needed for account deletion flow
-- ============================================================

CREATE POLICY "Users can delete own profile"
ON profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- ============================================================
-- Fix 3: Add missing INSERT/DELETE policies on subscriptions
-- Restricted to service_role only (Stripe webhooks)
-- This satisfies Supabase security warnings while keeping
-- the policies server-side only via service_role
-- ============================================================

CREATE POLICY "Service role can insert subscriptions"
ON subscriptions FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can delete subscriptions"
ON subscriptions FOR DELETE
TO service_role
USING (true);
