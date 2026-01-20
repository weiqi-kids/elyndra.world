-- Migration: Storage Buckets
-- Description: 建立 avatars 和 attachments 儲存桶

-- =====================
-- Storage Buckets
-- =====================

-- Create avatars bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Create attachments bucket (authenticated)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'attachments',
  'attachments',
  false,
  52428800 -- 50MB
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800;

-- =====================
-- Storage Policies
-- =====================

-- Avatars: Public read access
DROP POLICY IF EXISTS "Public avatars access" ON storage.objects;
CREATE POLICY "Public avatars access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Avatars: Authenticated users can upload to their own folder
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatars: Users can update their own avatar
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatars: Users can delete their own avatar
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Attachments: Authenticated users can read
DROP POLICY IF EXISTS "Authenticated can read attachments" ON storage.objects;
CREATE POLICY "Authenticated can read attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'attachments' AND
    auth.role() = 'authenticated'
  );

-- Attachments: Authenticated users can upload
DROP POLICY IF EXISTS "Authenticated can upload attachments" ON storage.objects;
CREATE POLICY "Authenticated can upload attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'attachments' AND
    auth.role() = 'authenticated'
  );
