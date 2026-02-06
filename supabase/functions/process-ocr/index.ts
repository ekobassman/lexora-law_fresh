// Edge Function: process-ocr
// Riceve immagine in base64, usa OpenAI Vision per estrarre dati dal documento

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-demo-mode',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const EXTRACT_PROMPT = `Tu sei un OCR di precisione per documenti ufficiali (lettere, avvisi, decreti). Estrai TUTTO il testo presente nell'immagine.

REGOLE CRITICHE - ANALISI COMPLETA:
1. Leggi OGNI parola, OGNI riga, OGNI carattere. NON troncare, NON omettere, NON riassumere.
2. fullText DEVE contenere l'intero contenuto del documento, dall'inizio alla fine, senza eccezioni.
3. Supporta tedesco, italiano, inglese, francese, spagnolo e altre lingue europee.
4. Mantieni la formattazione originale (paragrafi, interruzioni di riga dove presenti).
5. Per caratteri poco chiari: usa il contesto per correggere (es. "Finanzamt" non "pinanzamt", "Herrn" non "Herr").
6. Numeri, date, importi: trascrivi esattamente come appaiono (€, non £).
7. Umlaut: ä, ö, ü, ß - trascrivi correttamente.
8. Nomi propri e indirizzi: trascrivi con la massima accuratezza.

Estrai e ritorna un JSON con queste chiavi ESATTE:
- sender: mittente/emittente (autorità, azienda o persona che invia)
- recipient: destinatario (a chi è indirizzata la lettera)
- date: data del documento (formato YYYY-MM-DD se possibile)
- subject: oggetto/betreff/cause
- documentType: tipo (Lettera, Avviso, Decreto, etc.)
- fullText: TUTTO il testo del documento, dall'intestazione alla firma, COMPLETO, SENZA omissioni.

Rispondi SOLO con JSON valido, nessun markdown, nessun testo prima o dopo.`;

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
        temperature: 0.0,
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
