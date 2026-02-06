// Edge Function: process-ocr
// Pipeline: upload → OCR → analyze-and-draft
// Endpoint: POST /functions/v1/process-ocr

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-demo-mode',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const demoMode = req.headers.get('x-demo-mode') === 'true';

    // TODO: gestione multipart/form-data per upload file
    // TODO: integrazione OCR (Tesseract o servizio esterno)
    // TODO: analisi e bozza con OpenAI

    return new Response(
      JSON.stringify({
        ok: true,
        document_id: 'placeholder',
        file_path: 'placeholder',
        analysis: {},
        draft_text: '[Bozza da OCR] Da implementare.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
