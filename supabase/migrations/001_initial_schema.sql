-- Lexora: schema iniziale
-- Eseguire su Supabase Dashboard: SQL Editor → New query → Incolla → Run
-- Oppure: supabase db push (con Supabase CLI)

-- ============ 1. PROFILES ============
CREATE TABLE IF NOT EXISTS public.profiles (
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
  sender_full_name TEXT,
  sender_address TEXT,
  sender_city TEXT,
  sender_postal_code TEXT,
  sender_country TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  is_family BOOLEAN DEFAULT FALSE,
  plan_override TEXT,
  plan TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_insert_own ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (auth.uid() = id);

-- ============ 2. CASES ============
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  authority TEXT,
  aktenzeichen TEXT,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'new',
  letter_text TEXT,
  draft_response TEXT,
  tone TEXT DEFAULT 'formal',
  chat_history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_user_status ON cases(user_id, status);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY cases_select_own ON cases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY cases_insert_own ON cases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY cases_update_own ON cases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY cases_delete_own ON cases FOR DELETE USING (auth.uid() = user_id);

-- ============ 3. DOCUMENTS ============
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  file_name TEXT,
  mime_type TEXT,
  file_size_bytes BIGINT,
  ocr_text TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  direction TEXT DEFAULT 'incoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(bucket, path)
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id) WHERE case_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status) WHERE status = 'pending';
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY documents_select_own ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY documents_insert_own ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY documents_update_own ON documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY documents_delete_own ON documents FOR DELETE USING (auth.uid() = user_id);

-- ============ 4. CHAT_SESSIONS ============
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('dashboard', 'case')),
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_sessions_dashboard ON chat_sessions(user_id) WHERE scope = 'dashboard' AND case_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_case ON chat_sessions(user_id, case_id) WHERE case_id IS NOT NULL;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_sessions_select_own ON chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY chat_sessions_insert_own ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY chat_sessions_update_own ON chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY chat_sessions_delete_own ON chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- ============ 5. CHAT_MESSAGES ============
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  attachment_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(session_id, created_at);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_messages_select_own ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY chat_messages_insert_own ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY chat_messages_delete_own ON chat_messages FOR DELETE USING (auth.uid() = user_id);

-- ============ 6. CHAT_USAGE_DAILY ============
CREATE TABLE IF NOT EXISTS public.chat_usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  messages_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_chat_usage_user_date ON chat_usage_daily(user_id, usage_date);
ALTER TABLE public.chat_usage_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_usage_select_own ON chat_usage_daily FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY chat_usage_insert_own ON chat_usage_daily FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY chat_usage_update_own ON chat_usage_daily FOR UPDATE USING (auth.uid() = user_id);

-- ============ 7. USAGE_COUNTERS ============
CREATE TABLE IF NOT EXISTS public.usage_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_key TEXT NOT NULL,
  cases_created INTEGER NOT NULL DEFAULT 0,
  documents_processed INTEGER NOT NULL DEFAULT 0,
  ai_requests INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_key)
);

CREATE INDEX IF NOT EXISTS idx_usage_counters_user_period ON usage_counters(user_id, period_key);
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY usage_select_own ON usage_counters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY usage_insert_own ON usage_counters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY usage_update_own ON usage_counters FOR UPDATE USING (auth.uid() = user_id);

-- ============ 8. SUBSCRIPTIONS ============
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_select_own ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- ============ 9. TRIGGERS ============
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON profiles;
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS tr_cases_updated_at ON cases;
CREATE TRIGGER tr_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS tr_documents_updated_at ON documents;
CREATE TRIGGER tr_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS tr_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER tr_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS tr_chat_usage_daily_updated_at ON chat_usage_daily;
CREATE TRIGGER tr_chat_usage_daily_updated_at BEFORE UPDATE ON chat_usage_daily FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS tr_usage_counters_updated_at ON usage_counters;
CREATE TRIGGER tr_usage_counters_updated_at BEFORE UPDATE ON usage_counters FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS tr_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER tr_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Profilo automatico al signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
