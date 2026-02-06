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
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const { filePath, bucket } = body;

    // TODO: integrazione OCR (Tesseract o servizio esterno), analisi con OpenAI
    // Per ora ritorna struttura compatibile con il frontend
    const analysis = {
      documentType: 'Lettera',
      sender: 'Da rilevare',
      date: new Date().toISOString().slice(0, 10),
      subject: 'Da rilevare',
      ocr_text: '',
    };
    const draft_text = `[Bozza estratta da OCR]\n\nMittente: ${analysis.sender}\nData: ${analysis.date}\nOggetto: ${analysis.subject}\n\nTesto estratto: in elaborazione.`;

    return new Response(
      JSON.stringify({
        ok: true,
        document_id: 'placeholder',
        file_path: filePath ?? 'placeholder',
        analysis,
        draft_text,
        documentType: analysis.documentType,
        sender: analysis.sender,
        date: analysis.date,
        subject: analysis.subject,
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
