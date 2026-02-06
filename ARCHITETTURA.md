# ARCHITETTURA TECNICA LEXORA

Blueprint tecnica completa per l'implementazione del nuovo sistema. Basata su LOGICA.md.

---

## 1. SCHEMA DATABASE SUPABASE

### 1.1 Tabella `profiles`

Profilo utente esteso (1:1 con auth.users).

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'DE',
  preferred_language TEXT DEFAULT 'DE',
  preferred_country TEXT DEFAULT 'DE',
  -- Dati mittente per lettere
  sender_full_name TEXT,
  sender_address TEXT,
  sender_city TEXT,
  sender_postal_code TEXT,
  sender_country TEXT,
  -- Ruoli e piano
  is_admin BOOLEAN DEFAULT FALSE,
  is_family BOOLEAN DEFAULT FALSE,
  plan_override TEXT, -- 'free' | 'starter' | 'pro' | 'unlimited'
  plan TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT, -- 'active' | 'canceled' | 'past_due' | null
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_stripe_customer ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX idx_profiles_plan ON profiles(plan);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

---

### 1.2 Tabella `cases` (pratiche)

Pratiche legali degli utenti.

```sql
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  authority TEXT,
  aktenzeichen TEXT,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'new', -- 'new' | 'in_progress' | 'completed' | 'archived'
  letter_text TEXT,
  draft_response TEXT,
  tone TEXT DEFAULT 'formal',
  chat_history JSONB DEFAULT '[]', -- Legacy, preferire chat_messages
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_user_status ON cases(user_id, status);
CREATE INDEX idx_cases_created_at ON cases(created_at DESC);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
```

---

### 1.3 Tabella `documents`

Documenti caricati (lettere originali, allegati) e generati.

```sql
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  file_name TEXT,
  mime_type TEXT,
  file_size_bytes BIGINT,
  ocr_text TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'processing' | 'completed' | 'failed'
  error TEXT,
  direction TEXT DEFAULT 'incoming', -- 'incoming' | 'outgoing'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(bucket, path)
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_case_id ON documents(case_id) WHERE case_id IS NOT NULL;
CREATE INDEX idx_documents_status ON documents(status) WHERE status = 'pending';

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
```

---

### 1.4 Tabella `chat_sessions`

Sessioni chat (dashboard generica vs per caso).

```sql
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  scope TEXT NOT NULL, -- 'dashboard' | 'case'
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_scope CHECK (scope IN ('dashboard', 'case'))
);

CREATE UNIQUE INDEX idx_chat_sessions_dashboard ON chat_sessions(user_id) WHERE scope = 'dashboard' AND case_id IS NULL;
CREATE INDEX idx_chat_sessions_user_case ON chat_sessions(user_id, case_id) WHERE case_id IS NOT NULL;

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
```

---

### 1.5 Tabella `chat_messages`

Messaggi singoli nelle sessioni chat.

```sql
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' | 'assistant'
  content TEXT NOT NULL,
  attachment_type TEXT, -- 'image' | 'pdf' | null
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_role CHECK (role IN ('user', 'assistant'))
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(session_id, created_at);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
```

---

### 1.6 Tabella `chat_usage_daily`

Contatore messaggi chat per giorno (limiti piano).

```sql
CREATE TABLE public.chat_usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  messages_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, usage_date)
);

CREATE INDEX idx_chat_usage_user_date ON chat_usage_daily(user_id, usage_date);

ALTER TABLE public.chat_usage_daily ENABLE ROW LEVEL SECURITY;
```

---

### 1.7 Tabella `usage_counters`

Contatori mensili (pratiche create, documenti processati).

```sql
CREATE TABLE public.usage_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_key TEXT NOT NULL, -- 'YYYY-MM'
  cases_created INTEGER NOT NULL DEFAULT 0,
  documents_processed INTEGER NOT NULL DEFAULT 0,
  ai_requests INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_key)
);

CREATE INDEX idx_usage_counters_user_period ON usage_counters(user_id, period_key);

ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;
```

---

### 1.8 Tabella `subscriptions`

Stato abbonamenti Stripe (cache locale).

```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT, -- 'active' | 'canceled' | 'past_due' | 'trialing'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
```

---

### 1.9 Trigger

```sql
-- Aggiornamento updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_chat_usage_daily_updated_at BEFORE UPDATE ON chat_usage_daily FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_usage_counters_updated_at BEFORE UPDATE ON usage_counters FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Profilo al signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 2. ROW LEVEL SECURITY (RLS)

### 2.1 `profiles`

| Operazione | Policy | Condizione |
|------------|--------|------------|
| SELECT | `profiles_select_own` | `auth.uid() = id` |
| INSERT | `profiles_insert_own` | `auth.uid() = id` |
| UPDATE | `profiles_update_own` | `auth.uid() = id` |
| DELETE | Nessuna | Profili non cancellabili dall'utente |

```sql
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_insert_own ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (auth.uid() = id);
```

---

### 2.2 `cases`

| Operazione | Policy | Condizione |
|------------|--------|------------|
| SELECT | `cases_select_own` | `auth.uid() = user_id` |
| INSERT | `cases_insert_own` | `auth.uid() = user_id` |
| UPDATE | `cases_update_own` | `auth.uid() = user_id` |
| DELETE | `cases_delete_own` | `auth.uid() = user_id` |

```sql
CREATE POLICY cases_select_own ON cases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY cases_insert_own ON cases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY cases_update_own ON cases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY cases_delete_own ON cases FOR DELETE USING (auth.uid() = user_id);
```

---

### 2.3 `documents`

| Operazione | Policy | Condizione |
|------------|--------|------------|
| SELECT | `documents_select_own` | `auth.uid() = user_id` |
| INSERT | `documents_insert_own` | `auth.uid() = user_id` |
| UPDATE | `documents_update_own` | `auth.uid() = user_id` |
| DELETE | `documents_delete_own` | `auth.uid() = user_id` |

```sql
CREATE POLICY documents_select_own ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY documents_insert_own ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY documents_update_own ON documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY documents_delete_own ON documents FOR DELETE USING (auth.uid() = user_id);
```

---

### 2.4 `chat_sessions`

| Operazione | Policy | Condizione |
|------------|--------|------------|
| SELECT | `chat_sessions_select_own` | `auth.uid() = user_id` |
| INSERT | `chat_sessions_insert_own` | `auth.uid() = user_id` |
| UPDATE | `chat_sessions_update_own` | `auth.uid() = user_id` |
| DELETE | `chat_sessions_delete_own` | `auth.uid() = user_id` |

```sql
CREATE POLICY chat_sessions_select_own ON chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY chat_sessions_insert_own ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY chat_sessions_update_own ON chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY chat_sessions_delete_own ON chat_sessions FOR DELETE USING (auth.uid() = user_id);
```

---

### 2.5 `chat_messages`

| Operazione | Policy | Condizione |
|------------|--------|------------|
| SELECT | `chat_messages_select_own` | `auth.uid() = user_id` |
| INSERT | `chat_messages_insert_own` | `auth.uid() = user_id` |
| UPDATE | Nessuna | Messaggi non modificabili |
| DELETE | `chat_messages_delete_own` | `auth.uid() = user_id` |

```sql
CREATE POLICY chat_messages_select_own ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY chat_messages_insert_own ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY chat_messages_delete_own ON chat_messages FOR DELETE USING (auth.uid() = user_id);
```

---

### 2.6 `chat_usage_daily`

| Operazione | Policy | Condizione |
|------------|--------|------------|
| SELECT | `chat_usage_select_own` | `auth.uid() = user_id` |
| INSERT | `chat_usage_insert_own` | `auth.uid() = user_id` |
| UPDATE | `chat_usage_update_own` | `auth.uid() = user_id` |
| DELETE | Nessuna | Non cancellabile da utente |

```sql
CREATE POLICY chat_usage_select_own ON chat_usage_daily FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY chat_usage_insert_own ON chat_usage_daily FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY chat_usage_update_own ON chat_usage_daily FOR UPDATE USING (auth.uid() = user_id);
```

---

### 2.7 `usage_counters`

| Operazione | Policy | Condizione |
|------------|--------|------------|
| SELECT | `usage_select_own` | `auth.uid() = user_id` |
| INSERT | `usage_insert_own` | `auth.uid() = user_id` |
| UPDATE | `usage_update_own` | `auth.uid() = user_id` |
| DELETE | Nessuna | Non cancellabile da utente |

```sql
CREATE POLICY usage_select_own ON usage_counters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY usage_insert_own ON usage_counters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY usage_update_own ON usage_counters FOR UPDATE USING (auth.uid() = user_id);
```

---

### 2.8 `subscriptions`

| Operazione | Policy | Condizione |
|------------|--------|------------|
| SELECT | `subscriptions_select_own` | `auth.uid() = user_id` |
| INSERT | Service role | Solo webhook Stripe |
| UPDATE | Service role | Solo webhook Stripe |
| DELETE | Nessuna | Non cancellabile da utente |

```sql
CREATE POLICY subscriptions_select_own ON subscriptions FOR SELECT USING (auth.uid() = user_id);
-- INSERT/UPDATE gestiti da Edge Function con service_role
```

---

## 3. EDGE FUNCTIONS

### 3.1 `chat-completion`

| Campo | Valore |
|-------|--------|
| **Scopo** | API unificata per chat: demo, dashboard, edit |
| **Endpoint** | `POST /functions/v1/chat-completion` |
| **Auth** | Opzionale per demo, obbligatoria per dashboard/edit |
| **Chiamata da** | DemoChatSection, DashboardAIChat, ChatWithAI |

**Input**:
```typescript
interface ChatCompletionInput {
  message: string;
  language: string;
  mode: 'demo' | 'dashboard' | 'edit';
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  isFirstMessage?: boolean;
  caseId?: string;
  userProfile?: UserProfileContext;
  caseContext?: CaseContext;
  letterText?: string;
  draftResponse?: string;
  praticaData?: { authority?: string; aktenzeichen?: string; deadline?: string; title: string };
  legalSearchContext?: LegalSearchResult[];
}
```

**Output**:
```typescript
interface ChatCompletionOutput {
  ok: boolean;
  reply: string;
  draftText?: string | null;
  draftReady?: boolean;
  suggestedAction?: { type: string; payload: { draftResponse?: string; title?: string } };
  messagesUsed?: number;
  messagesLimit?: number;
  error?: string;
}
```

---

### 3.2 `generate-document`

| Campo | Valore |
|-------|--------|
| **Scopo** | Genera bozza formale da dati raccolti (post-conferma) |
| **Endpoint** | `POST /functions/v1/generate-document` |
| **Auth** | Obbligatoria |
| **Chiamata da** | Dopo conferma utente in chat |

**Input**:
```typescript
interface GenerateDocumentInput {
  documentType: 'school_absence' | 'employer_letter' | 'landlord_letter' | 'authority_letter' | 'generic';
  data: Record<string, string>;
  language: string;
  letterFormat: 'din5008' | 'standard' | 'uk';
}
```

**Output**:
```typescript
interface GenerateDocumentOutput {
  ok: boolean;
  draftText: string;
  error?: string;
}
```

---

### 3.3 `process-ocr`

| Campo | Valore |
|-------|--------|
| **Scopo** | Pipeline completa: upload → OCR → analyze-and-draft |
| **Endpoint** | `POST /functions/v1/process-ocr` (o split: upload-document + ocr-document + analyze-and-draft) |
| **Auth** | Obbligatoria o X-Demo-Mode |
| **Chiamata da** | DemoChatSection (file upload), DashboardAIChat (scan page) |

**Input (upload-document)**:
- `multipart/form-data`: file, caseId?, source? (upload|camera)
- Header: `X-Demo-Mode: true` per utenti anonimi

**Output (upload-document)**:
```typescript
{ ok: true; document_id: string; file_path: string; signed_url?: string }
```

**Input (ocr-document)**:
```typescript
{ document_id: string }
```

**Output (analyze-and-draft)**:
```typescript
{ ok: true; document_id: string; analysis: AnalysisItem; draft_text: string; ocr_text?: string }
```

---

### 3.4 `stripe-webhook`

| Campo | Valore |
|-------|--------|
| **Scopo** | Gestione eventi Stripe (subscription, checkout, invoice) |
| **Endpoint** | `POST /functions/v1/stripe-webhook` |
| **Auth** | Firma Stripe (stripe-signature) |
| **Chiamata da** | Stripe (webhook) |

**Eventi**:
- `checkout.session.completed`
- `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
- `invoice.paid`, `invoice.payment_failed`

**Output**: `{ received: true }` (200)

---

### 3.5 `check-usage`

| Campo | Valore |
|-------|--------|
| **Scopo** | Verifica limiti piano (messaggi, pratiche mensili) |
| **Endpoint** | `POST /functions/v1/check-usage` o `GET /functions/v1/entitlements` |
| **Auth** | Obbligatoria |
| **Chiamata da** | Frontend prima di azioni limitate, o interno in chat-completion |

**Input**: Nessuno (user da JWT)

**Output**:
```typescript
interface EntitlementsOutput {
  plan: 'free' | 'starter' | 'pro' | 'unlimited';
  role: 'user' | 'admin';
  limits: { messages: number | null; cases: number | null };
  messagesUsed?: number;
  casesUsed?: number;
  access_state?: 'active' | 'blocked';
}
```

---

## 4. STRUTTURA FRONTEND

### 4.1 Route (React Router)

```
/                     → Landing (Homepage)
/demo                 → Demo Chat (se ?demo=1 o path)
/demo/letter-preview  → Preview bozza (session storage)
/auth                 → Auth (login/signup)
/dashboard            → Dashboard (chat + lista casi)
/scan                 → Scan documenti (camera + upload)
/pratiche             → Lista pratiche
/pratiche/:id         → Dettaglio pratica + Chat Edit
/pratiche/:id/edit    → Modifica pratica
/pratiche/new         → Nuova pratica
/pricing              → Prezzi
/subscription         → Gestione abbonamento
/checkout-success     → Post-checkout Stripe
/settings             → Impostazioni (lingua, paese, profilo)
/support              → Supporto
/terms                → Termini di servizio
/privacy              → Privacy policy
/admin                → Pannello admin (protetto)
/*                    → 404
```

---

### 4.2 Componenti principali

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── MobileNav.tsx
│   ├── chat/
│   │   ├── DemoChatSection.tsx
│   │   ├── DashboardChat.tsx
│   │   ├── ChatEdit.tsx
│   │   ├── ChatMessage.tsx
│   │   └── ChatInput.tsx
│   ├── documents/
│   │   ├── DocumentUpload.tsx
│   │   ├── DocumentList.tsx
│   │   └── LetterPreview.tsx
│   ├── cases/
│   │   ├── CaseList.tsx
│   │   ├── CaseCard.tsx
│   │   └── CaseDetail.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pricing/
│   │   ├── PricingCard.tsx
│   │   └── PlanLimitPopup.tsx
│   └── ui/          # shadcn/ui components
├── pages/
│   ├── Landing.tsx
│   ├── Auth.tsx
│   ├── Dashboard.tsx
│   ├── ScanDocument.tsx
│   ├── CaseDetail.tsx
│   ├── EditCase.tsx
│   ├── Pricing.tsx
│   └── ...
├── contexts/
│   ├── AuthContext.tsx
│   ├── LanguageContext.tsx
│   └── ThemeContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useEntitlements.ts
│   ├── useChatSession.ts
│   ├── useCases.ts
│   └── useLanguage.ts
└── lib/
    ├── supabase.ts
    ├── api.ts
    └── utils.ts
```

---

### 4.3 State management

- **AuthContext**: user, session, signIn, signUp, signOut, loading
- **LanguageContext**: language, country, setLanguage, setCountry, t (i18n)
- **ThemeContext**: theme (light/dark/system)
- **Nessun Redux/Zustand globale**: stato locale con React Query/SWR per fetch, Context solo per auth/language/theme

---

### 4.4 Hook custom

| Hook | Scopo |
|------|-------|
| `useAuth` | Wrapper AuthContext |
| `useEntitlements` | Plan, limits, messagesUsed, isAdmin |
| `useChatSession` | Messaggi, sendMessage, clearChat (per session_id) |
| `useCases` | Lista casi, createCase, updateCase |
| `useLanguage` | Wrapper LanguageContext |
| `usePlanState` | Plan, isPaid, isUnlimited |
| `useDemoMigration` | Check e import migrazione demo → dashboard |

---

### 4.5 Layout e navigazione

- **Header**: logo, LanguageSelector, CountrySelector, nav (Dashboard, Prezzi), Login/Signup o avatar
- **Footer**: link legali, social
- **Mobile**: drawer/hamburger per nav
- **Dashboard**: sidebar con lista casi + area chat centrale
- **Case detail**: tab o split: documento/bozza | chat edit

---

## 5. API INTEGRATIONS

### 5.1 OpenAI

| Parametro | Valore |
|-----------|--------|
| **Modello** | `gpt-4o-mini` o `gpt-4.1-mini` |
| **Temperature** | 0.4 (generazione documenti), 0.7 (chat conversazionale) |
| **max_tokens** | 4096 |
| **System prompt** | UNIFIED_LEXORA_IDENTITY + regole lingua + regole documento + document gate |

**System prompt structure**:
```
1. Identità Lexora (avvocato digitale, ambito legale/amministrativo)
2. Regola lingua (rispondi in ${language})
3. Regole documento (raccogli dati → riepilogo → conferma → genera)
4. Divieto placeholder assoluto
5. Scope gate (rifiuta non-legale)
6. Contesto iniettato (profilo, caso, documenti OCR)
```

---

### 5.2 Supabase

```typescript
// Client config
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Realtime (opzionale per chat)
supabase.channel('chat').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, callback);
```

---

### 5.3 Stripe

```typescript
// Checkout session
const { data } = await supabase.functions.invoke('create-checkout', {
  body: { price_id: string; success_url: string; cancel_url: string },
});

// Redirect
window.location.href = data.url;

// Customer portal
const { data } = await supabase.functions.invoke('customer-portal', {
  body: { return_url: string },
});
window.location.href = data.url;
```

---

## 6. SISTEMA MULTI-LINGUA

### 6.1 Gestione traduzioni (i18n)

- **Libreria**: react-i18next + i18next
- **File**: `src/locales/{ar,de,en,es,fr,it,pl,ro,ru,tr,uk}.json`
- **Chiavi**: namespaced, es. `demoChat.sectionTitle`, `chat.thinking`

```typescript
i18n.use(initReactI18next).init({
  resources: { ar: {...}, de: {...}, ... },
  lng: 'de',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});
```

---

### 6.2 Determinazione lingua

1. **Priorità**: localStorage `lexora_language` → profilo `preferred_language` → paese `defaultLanguage` → browser `navigator.language` → `en`
2. **Country**: localStorage `lexora_country` → profilo `preferred_country` → geolocation/browser → `OTHER`

---

### 6.3 Formato dati per paese

| Campo | DE/AT/CH | IT/FR/ES | UK |
|-------|----------|----------|-----|
| Data | DD.MM.YYYY | DD/MM/YYYY | DD/MM/YYYY |
| Indirizzo | DIN 5008 | Standard | UK format |
| Oggetto | Betreff: | Oggetto: | Subject: |
| Chiusura | Mit freundlichen Grüßen | Cordiali saluti | Yours sincerely |

```typescript
const formatDate = (date: Date, country: Country) => {
  if (['DE','AT','CH'].includes(country)) return format(date, 'dd.MM.yyyy');
  return format(date, 'dd/MM/yyyy');
};
```

---

### 6.4 Normative locali

- **legalRulesEngine**: mappa paese → { authorityTerm, letterFormat, dateFormat }
- **intakeConfig**: campi per tipo documento (shared)
- **Prompt AI**: inietta `letterFormat` e `authorityTerm` nel system prompt

---

## 7. PWA ARCHITECTURE

### 7.1 manifest.json

```json
{
  "name": "Lexora",
  "short_name": "Lexora",
  "description": "AI Legal Assistant",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0B1C2D",
  "theme_color": "#C9A24D",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "categories": ["business", "productivity"]
}
```

---

### 7.2 Service Worker (Vite PWA)

- **Strategia cache**: `CacheFirst` per static assets, `NetworkFirst` per API
- **Precache**: index.html, js, css, fonts
- **Runtime cache**: immagini, API responses (con expiry)

```typescript
// vite.config
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          { urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i, handler: 'NetworkFirst', options: {...} },
        ],
      },
    }),
  ],
});
```

---

### 7.3 Install prompt

- **BeforeInstallPrompt**: salvare event, mostrare banner dopo N interazioni o dopo generazione documento
- **iOS**: guida manuale (Aggiungi a Home)
- **Android**: prompt nativo

```typescript
const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
useEffect(() => {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); setDeferredPrompt(e); });
}, []);
```

---

### 7.4 Offline

- **Landing e shell**: disponibili offline (precache)
- **Chat/API**: messaggio "Connessione assente" e retry
- **Sync**: nessuna sync automatica; utente ritenta al ritorno online

---

## 8. SICUREZZA & PERFORMANCE

### 8.1 Validazioni input

- **Messaggi chat**: max 4000 caratteri, trim
- **File upload**: max 10MB, mime types consentiti (image/jpeg, image/png, image/webp, application/pdf)
- **HEIC**: rifiutato con messaggio esplicito
- **Placeholder**: regex per bloccare output AI con [Nome], [Data], ecc.

---

### 8.2 Rate limiting

- **Edge Functions**: rate limit per IP (es. 60 req/min) a livello Supabase
- **Chat**: limite per piano (messaggi/giorno) in chat_usage_daily
- **Upload**: limite dimensionale per file

---

### 8.3 Ottimizzazioni query

- **Indici**: su user_id, case_id, (user_id, status), (user_id, usage_date)
- **Select mirati**: evitare `SELECT *`, usare colonne necessarie
- **Paginazione**: lista casi e messaggi chat con LIMIT/OFFSET o cursor
- **RPC**: `increment_documents_processed`, `increment_chat_usage` per atomicità

---

### 8.4 Gestione errori

- **Frontend**: toast per errori utente, boundary per crash
- **Edge Functions**: try/catch, log structured, risposta `{ ok: false, error: string }`
- **Retry**: esponenziale per errori 5xx e rete (max 3 tentativi)
- **Fallback**: messaggio locale in caso di AI_PROVIDER_ERROR

---

## Interfacce TypeScript di riferimento

```typescript
// Profilo
interface Profile {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  preferred_language: string;
  preferred_country: string;
  sender_full_name: string | null;
  sender_address: string | null;
  plan: 'free' | 'starter' | 'pro' | 'unlimited';
  is_admin: boolean;
}

// Caso
interface Case {
  id: string;
  user_id: string;
  title: string;
  authority: string | null;
  aktenzeichen: string | null;
  deadline: string | null;
  status: 'new' | 'in_progress' | 'completed' | 'archived';
  letter_text: string | null;
  draft_response: string | null;
  created_at: string;
  updated_at: string;
}

// Messaggio chat
interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  attachment_type: 'image' | 'pdf' | null;
  created_at: string;
}

// Document type
type DocumentType = 'school_absence' | 'employer_letter' | 'landlord_letter' | 'authority_letter' | 'generic';
```

---

*Fine documento ARCHITETTURA.md*
