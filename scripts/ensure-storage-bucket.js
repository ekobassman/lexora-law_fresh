/**
 * Create Lexora Storage bucket if it does not exist.
 * Uses Supabase Admin API (SERVICE_ROLE_KEY).
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STORAGE_BUCKET (optional, default: documents)
 * Run: node scripts/ensure-storage-bucket.js
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.STORAGE_BUCKET ?? 'documents';

const projectRef = supabaseUrl
  ? new URL(supabaseUrl).hostname.replace(/\.supabase\.co$/, '')
  : 'unknown';

console.log('[ensure-storage-bucket] bucket name:', bucketName);
console.log('[ensure-storage-bucket] supabase project ref:', projectRef);

if (!supabaseUrl || !serviceRoleKey) {
  console.error('[ensure-storage-bucket] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error('[ensure-storage-bucket] Failed to list buckets:', listError.message);
    process.exit(1);
  }

  const exists = buckets?.some((b) => b.name === bucketName);
  if (exists) {
    console.log('[ensure-storage-bucket] Bucket already exists');
    return;
  }

  const { data, error } = await supabase.storage.createBucket(bucketName, {
    public: false,
    fileSizeLimit: 20 * 1024 * 1024, // 20MB in bytes
    allowedMimeTypes: ['image/*', 'application/pdf'],
  });

  if (error) {
    console.error('[ensure-storage-bucket] Failed to create bucket:', error.message);
    process.exit(1);
  }

  console.log('[ensure-storage-bucket] Bucket created successfully:', data?.name ?? bucketName);
}

main();
