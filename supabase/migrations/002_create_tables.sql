-- Lexora: tabelle essenziali (fallback se 001 non è stato eseguito)
-- Eseguire su Supabase Dashboard: SQL Editor → Incolla → Run
-- Oppure: supabase db push

-- ============ CASES ============
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nuova pratica',
  authority TEXT,
  aktenzeichen TEXT,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'new',
  document_type TEXT,
  letter_text TEXT,
  draft_response TEXT,
  tone TEXT DEFAULT 'formal',
  chat_history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_user_status ON cases(user_id, status);
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cases_select_own ON cases;
DROP POLICY IF EXISTS cases_insert_own ON cases;
DROP POLICY IF EXISTS cases_update_own ON cases;
DROP POLICY IF EXISTS cases_delete_own ON cases;
CREATE POLICY cases_select_own ON cases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY cases_insert_own ON cases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY cases_update_own ON cases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY cases_delete_own ON cases FOR DELETE USING (auth.uid() = user_id);

-- ============ DOCUMENTS ============
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
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS documents_select_own ON documents;
DROP POLICY IF EXISTS documents_insert_own ON documents;
DROP POLICY IF EXISTS documents_update_own ON documents;
DROP POLICY IF EXISTS documents_delete_own ON documents;
CREATE POLICY documents_select_own ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY documents_insert_own ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY documents_update_own ON documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY documents_delete_own ON documents FOR DELETE USING (auth.uid() = user_id);

-- ============ CHAT_SESSIONS ============
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('dashboard', 'case')),
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_case ON chat_sessions(user_id, case_id);
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS chat_sessions_select_own ON chat_sessions;
DROP POLICY IF EXISTS chat_sessions_insert_own ON chat_sessions;
DROP POLICY IF EXISTS chat_sessions_update_own ON chat_sessions;
DROP POLICY IF EXISTS chat_sessions_delete_own ON chat_sessions;
CREATE POLICY chat_sessions_select_own ON chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY chat_sessions_insert_own ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY chat_sessions_update_own ON chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY chat_sessions_delete_own ON chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- ============ CHAT_MESSAGES ============
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
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS chat_messages_select_own ON chat_messages;
DROP POLICY IF EXISTS chat_messages_insert_own ON chat_messages;
DROP POLICY IF EXISTS chat_messages_delete_own ON chat_messages;
CREATE POLICY chat_messages_select_own ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY chat_messages_insert_own ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY chat_messages_delete_own ON chat_messages FOR DELETE USING (auth.uid() = user_id);
