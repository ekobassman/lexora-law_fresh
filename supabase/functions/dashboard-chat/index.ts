// Edge Function: dashboard-chat
// Chat for dashboard (general or document mode). In-function diagnostics via x-lexora-debug: 1

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-lexora-debug',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(data: object, status: number, headers?: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, ...headers, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  // Always handle CORS preflight
  if (req.method === 'OPTIONS') {
    return jsonResponse({ ok: true }, 200);
  }

  const authHeader = req.headers.get('Authorization');
  const debugMode = req.headers.get('x-lexora-debug') === '1';

  // Debug: return diagnostics without calling OpenAI (testable without CLI logs)
  if (debugMode) {
    let body: unknown = null;
    try {
      body = await req.json();
    } catch {
      body = null;
    }
    const bodyObj = body && typeof body === 'object' ? body as Record<string, unknown> : {};
    return jsonResponse({
      ok: true,
      debug: true,
      hasAuth: Boolean(authHeader),
      authHeaderPrefix: authHeader ? authHeader.slice(0, 10) : null,
      hasOpenAIKey: Boolean(Deno.env.get('OPENAI_API_KEY')),
      method: req.method,
      origin: req.headers.get('origin'),
      hasBody: body != null,
      bodyKeys: Object.keys(bodyObj),
    }, 200);
  }

  try {
    if (!authHeader) {
      return jsonResponse({ ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
    }

    const body = await req.json().catch(() => ({}));
    if (typeof body !== 'object' || body === null) {
      return jsonResponse({ ok: false, error: 'Invalid body', code: 'BAD_REQUEST' }, 400);
    }
    const { mode, documentId, caseId, messages, context } = body as { mode?: string; documentId?: string; caseId?: string; messages?: unknown[]; context?: unknown };

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return jsonResponse({ ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return jsonResponse({
        ok: true,
        assistant_message: 'Il servizio chat è in configurazione. Riprova tra poco.',
        suggested_draft: null,
      }, 200);
    }

    const ctx = context as { ocr_text?: string; analysis_json?: unknown; draft_reply?: string } | undefined;
    const systemPrompt = mode === 'document' && ctx
      ? `Sei Lexora, assistente per lettere ufficiali. L'utente ha un documento con: OCR: ${ctx.ocr_text || 'N/A'}. Analisi: ${JSON.stringify(ctx.analysis_json || {}).slice(0, 500)}. Bozza attuale: ${(ctx.draft_reply || '').slice(0, 500)}. Rispondi in modo utile. Se suggerisci una bozza di risposta completa, includila in un blocco markdown con etichetta [BOZZA] alla fine del messaggio.`
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
      return jsonResponse({
        ok: true,
        assistant_message: 'Si è verificato un errore. Riprova.',
        suggested_draft: null,
      }, 200);
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
    const analysis = (ctx?.analysis_json as Record<string, unknown>) ?? {};
    const risks = Array.isArray(analysis.risks) ? analysis.risks : [];
    const deadlines = Array.isArray(analysis.deadlines) ? analysis.deadlines : [];

    return jsonResponse({
      ok: true,
      message: assistant_message,
      assistant_message,
      suggested_draft: suggested_draft || null,
      caseId: caseId ?? null,
      documentId: documentId ?? null,
      ocrText: ctx?.ocr_text ?? null,
      analysis: { risks, deadlines },
      draft: suggested_draft
        ? { body: suggested_draft, format: 'DIN5008' }
        : null,
    }, 200);
  } catch (err) {
    console.error('dashboard-chat error:', err);
    return jsonResponse({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});
