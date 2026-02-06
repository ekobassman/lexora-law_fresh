#!/usr/bin/env node
/**
 * Test process-ocr Edge Function
 * Run: node scripts/test-process-ocr.js
 * Requires: .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
let env = {};
try {
  const envContent = readFileSync(join(root, '.env'), 'utf8');
  envContent.split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
} catch {
  console.error('ERRORE: .env non trovato. Crea .env con VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('ERRORE: .env deve contenere VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// 1x1 pixel PNG (minimal valid image)
const testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const endpoint = `${url.replace(/\/$/, '')}/functions/v1/process-ocr`;

console.log('Testing process-ocr at:', endpoint);
console.log('');

const res = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${key}`,
    'apikey': key,
  },
  body: JSON.stringify({ imageBase64: testBase64, mimeType: 'image/png' }),
});

const data = await res.json().catch(() => ({}));

if (res.ok && data?.ok) {
  console.log('✅ process-ocr OK - GPT-4o funziona!');
  console.log('   draft_text length:', data.draft_text?.length ?? 0);
} else {
  console.log('❌ process-ocr FALLITO');
  console.log('   HTTP:', res.status);
  console.log('   Response:', JSON.stringify(data, null, 2));
  if (data?.error?.includes('OPENAI') || res.status === 500) {
    console.log('');
    console.log('   → Verifica: supabase secrets set OPENAI_API_KEY=sk-...');
  }
  process.exit(1);
}
