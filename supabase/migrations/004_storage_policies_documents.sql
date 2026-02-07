-- Storage RLS policies for Lexora documents bucket.
-- Path format: {user_id}/{uuid}-{filename} → first path segment = auth.uid().

-- Drop existing policies if re-running (e.g. bucket name change)
DROP POLICY IF EXISTS storage_documents_insert_own ON storage.objects;
DROP POLICY IF EXISTS storage_documents_select_own ON storage.objects;
DROP POLICY IF EXISTS storage_documents_delete_own ON storage.objects;

-- Authenticated users can INSERT into the bucket only under their own folder (user_id prefix)
CREATE POLICY storage_documents_insert_own ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = (SELECT auth.jwt() ->> 'sub')
);

-- Authenticated users can SELECT (download) their own files only
CREATE POLICY storage_documents_select_own ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = (SELECT auth.jwt() ->> 'sub')
);

-- Authenticated users can DELETE their own files only
CREATE POLICY storage_documents_delete_own ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = (SELECT auth.jwt() ->> 'sub')
);
