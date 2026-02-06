// Edge Function: generate-document
// Genera bozza formale da dati raccolti
// Endpoint: POST /functions/v1/generate-document

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { data } = body;
    const d = data || {};

    const today = new Date().toISOString().slice(0, 10);
    const draftText = `${d.sender || '[Mittente]'}
[Indirizzo]
${d.date || today}

${d.recipient || '[Destinatario]'}
[Indirizzo]

Oggetto: ${d.subject || '[Oggetto]'}

Egregi Signori,

${d.content || 'La presente per comunicarVi quanto richiesto.'}

Cordiali saluti,
[Firma]`;

    return new Response(
      JSON.stringify({ ok: true, draftText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
