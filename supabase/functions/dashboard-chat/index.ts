// Edge Function: dashboard-chat
// Chat for dashboard (general or document mode)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { mode, documentId, caseId, messages, context } = body;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          ok: true,
          assistant_message: 'Il servizio chat è in configurazione. Riprova tra poco.',
          suggested_draft: null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const systemPrompt = mode === 'document' && context
      ? `Sei Lexora, assistente per lettere ufficiali. L'utente ha un documento con: OCR: ${context.ocr_text || 'N/A'}. Analisi: ${JSON.stringify(context.analysis_json || {}).slice(0, 500)}. Bozza attuale: ${(context.draft_reply || '').slice(0, 500)}. Rispondi in modo utile. Se suggerisci una bozza di risposta completa, includila in un blocco markdown con etichetta [BOZZA] alla fine del messaggio.`
      : `Sei Lexora, assistente per lettere ufficiali. Modalità generale: rispondi alle domande dell'utente. Se suggerisci una bozza di risposta, includila in un blocco con etichetta [BOZZA].`;

    const msgs: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...(messages || []).map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 2048,
        messages: msgs,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI error:', response.status, err);
      return new Response(
        JSON.stringify({
          ok: true,
          assistant_message: 'Si è verificato un errore. Riprova.',
          suggested_draft: null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content?.trim() ?? '';

    let suggested_draft: string | null = null;
    const draftMatch = content.match(/\[BOZZA\]\s*([\s\S]*?)(?:\n\n|$)/);
    if (draftMatch) {
      suggested_draft = draftMatch[1].trim();
    }

    const assistant_message = draftMatch
      ? content.replace(/\[BOZZA\]\s*[\s\S]*/g, '').trim()
      : content;

    // Standardized UI contract: ok, message, caseId, documentId, ocrText?, analysis?, draft?
    const analysis = (context?.analysis_json as Record<string, unknown>) ?? {};
    const risks = Array.isArray(analysis.risks) ? analysis.risks : [];
    const deadlines = Array.isArray(analysis.deadlines) ? analysis.deadlines : [];

    return new Response(
      JSON.stringify({
        ok: true,
        message: assistant_message,
        assistant_message,
        suggested_draft: suggested_draft || null,
        caseId: caseId ?? null,
        documentId: documentId ?? null,
        ocrText: context?.ocr_text ?? null,
        analysis: { risks, deadlines },
        draft: suggested_draft
          ? { body: suggested_draft, format: 'DIN5008' }
          : null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    console.error('dashboard-chat error:', err);
    // Return 200 with friendly message so frontend never shows generic "Chat error"
    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Al momento non posso rispondere. Riprova tra poco o usa Scan/Upload per analizzare un documento.',
        assistant_message: 'Al momento non posso rispondere. Riprova tra poco o usa Scan/Upload per analizzare un documento.',
        suggested_draft: null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
