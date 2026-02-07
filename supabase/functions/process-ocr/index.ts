// Edge Function: process-ocr
// Riceve immagine in base64, usa OpenAI Vision per estrarre dati dal documento

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-demo-mode',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const EXTRACT_PROMPT = `Transcribe EXACTLY the text visible in the image.
DO NOT add, guess, or correct anything.
If a character or word is unclear, replace it with the symbol '□'.
Preserve line breaks where reasonable.
Return ONLY a valid JSON object (no markdown, no text before or after) with these exact keys:
- fullText: ONLY the transcribed text, following the rules above. Do not invent or correct characters.
- sender: sender/authority (only if clearly visible; otherwise "Non rilevato")
- recipient: recipient (only if clearly visible; otherwise "Non rilevato")
- date: document date YYYY-MM-DD (only if clearly visible; otherwise today's date)
- subject: subject (only if clearly visible; otherwise "Non rilevato")
- documentType: e.g. Lettera, Avviso, Decreto (only if clearly visible; otherwise "Lettera")

For fullText: transcribe character-by-character what you see. Use □ for any unclear character. Do not guess or correct.`;

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
        model: 'gpt-4o',
        temperature: 0,
        max_tokens: 8192,
        messages: [
          { role: 'user', content: [
            { type: 'text', text: EXTRACT_PROMPT },
            { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
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

    const fullText = analysis.fullText ?? '';
    const replacementCount = (fullText.match(/□/g) || []).length;
    const nonSpaceLength = fullText.replace(/\s/g, '').length || 1;
    const ocr_quality = replacementCount > 5 || replacementCount / nonSpaceLength > 0.02
      ? 'LOW_QUALITY'
      : 'HIGH_QUALITY';

    const draft_text = `[Bozza estratta da documento]\n\nMittente: ${analysis.sender}\nDestinatario: ${analysis.recipient}\nData: ${analysis.date}\nOggetto: ${analysis.subject}\n\n${fullText || 'Testo da completare.'}`;

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
        ocr_quality,
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
