-- ACIM Phase 1C.1: Run once in the SAME Supabase project as ACIM.
-- The CRG head catalog is packaged as a read-only snapshot; no FIS tables are changed.
ALTER TABLE public.acim_clubs ADD COLUMN IF NOT EXISTS head_id text;
CREATE INDEX IF NOT EXISTS acim_clubs_head_id_idx ON public.acim_clubs (head_id) WHERE head_id IS NOT NULL;
-- Optional check after running:
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema='public' AND table_name='acim_clubs' AND column_name='head_id';
