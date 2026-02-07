-- Add draft_reply and analysis_json to documents for dashboard
-- Idempotent: only add if columns don't exist

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'draft_reply'
  ) THEN
    ALTER TABLE public.documents ADD COLUMN draft_reply TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'analysis_json'
  ) THEN
    ALTER TABLE public.documents ADD COLUMN analysis_json JSONB;
  END IF;
END $$;
