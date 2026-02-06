// Edge Function: chat-completion
// API unificata per chat demo, dashboard, edit
// Endpoint: POST /functions/v1/chat-completion

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { message, language, mode, conversationHistory, caseId, letterText, draftResponse } = body;

    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader ?? '' } } }
    );

    // TODO: integrazione OpenAI, gestione mode demo/dashboard/edit
    // Per ora risposta placeholder
    const reply = `[chat-completion] Modalità: ${mode}, lingua: ${language}. Integrazione OpenAI da implementare.`;

    return new Response(
      JSON.stringify({ ok: true, reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
