// Edge Function: process-ocr
// Riceve immagine in base64, usa OpenAI Vision per estrarre dati dal documento

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-demo-mode',
};

const EXTRACT_PROMPT = `Analizza questo documento e estrai i seguenti dati in formato JSON (usa esattamente queste chiavi):
- sender: mittente (nome/ente che ha scritto)
- recipient: destinatario
- date: data del documento (formato YYYY-MM-DD se presente, altrimenti stringa)
- subject: oggetto/soggetto
- documentType: tipo (es. Lettera, Raccomandata, Avviso, Contratto, ecc.)
- fullText: testo completo estratto (se leggibile)

Ritorna SOLO un JSON valido, senza markdown o testo aggiuntivo.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const { imageBase64, mimeType } = body;

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ ok: false, error: 'OPENAI_API_KEY non configurata' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Fallback: nessuna immagine → risposta placeholder
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      const fallback = {
        documentType: 'Lettera',
        sender: 'Non rilevato',
        recipient: 'Non rilevato',
        date: new Date().toISOString().slice(0, 10),
        subject: 'Non rilevato',
        fullText: '',
      };
      const draft_text = `[Bozza da documento]\n\nMittente: ${fallback.sender}\nDestinatario: ${fallback.recipient}\nData: ${fallback.date}\nOggetto: ${fallback.subject}\n\nTesto: da completare.`;
      return new Response(
        JSON.stringify({
          ok: true,
          analysis: fallback,
          draft_text,
          ...fallback,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Assicurati che imageBase64 sia un data URL valido
    const imageUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: [
            { type: 'text', text: EXTRACT_PROMPT },
            { type: 'image_url', image_url: { url: imageUrl } },
          ]},
        ],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('OpenAI error:', response.status, errBody);
      return new Response(
        JSON.stringify({ ok: false, error: 'Errore analisi documento' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content?.trim() ?? '';

    let analysis: Record<string, string> = {
      documentType: 'Lettera',
      sender: 'Non rilevato',
      recipient: 'Non rilevato',
      date: new Date().toISOString().slice(0, 10),
      subject: 'Non rilevato',
      fullText: '',
    };

    try {
      const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (typeof parsed === 'object') {
        analysis = { ...analysis, ...parsed };
      }
    } catch {
      analysis.fullText = content || 'Testo non estrattabile.';
    }

    const draft_text = `[Bozza estratta da documento]\n\nMittente: ${analysis.sender}\nDestinatario: ${analysis.recipient}\nData: ${analysis.date}\nOggetto: ${analysis.subject}\n\n${analysis.fullText || 'Testo da completare.'}`;

    return new Response(
      JSON.stringify({
        ok: true,
        analysis,
        draft_text,
        documentType: analysis.documentType,
        sender: analysis.sender,
        recipient: analysis.recipient,
        date: analysis.date,
        subject: analysis.subject,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    console.error('process-ocr error:', err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
