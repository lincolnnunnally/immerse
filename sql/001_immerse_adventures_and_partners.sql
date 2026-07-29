-- Immerse: adventures (YouTube), stay interest, park partner interest
-- Applied to LPL shared Supabase (public schema)

CREATE TABLE IF NOT EXISTS public.immerse_adventures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id text,
  site_name text,
  title text NOT NULL,
  story text,
  youtube_url text NOT NULL,
  youtube_id text NOT NULL,
  state text,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS immerse_adventures_public_idx
  ON public.immerse_adventures (is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS immerse_adventures_user_idx
  ON public.immerse_adventures (auth_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.immerse_stay_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id text NOT NULL,
  site_name text,
  arrival date,
  nights int,
  guests int,
  email text,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  agreed_rules jsonb,
  status text NOT NULL DEFAULT 'interest',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.immerse_park_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name text NOT NULL,
  contact_name text,
  email text NOT NULL,
  phone text,
  park_system text,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.immerse_adventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immerse_stay_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immerse_park_partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS immerse_adventures_select ON public.immerse_adventures;
CREATE POLICY immerse_adventures_select ON public.immerse_adventures
  FOR SELECT USING (is_public = true OR auth.uid() = auth_user_id);

DROP POLICY IF EXISTS immerse_adventures_insert ON public.immerse_adventures;
CREATE POLICY immerse_adventures_insert ON public.immerse_adventures
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS immerse_adventures_update ON public.immerse_adventures;
CREATE POLICY immerse_adventures_update ON public.immerse_adventures
  FOR UPDATE USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS immerse_adventures_delete ON public.immerse_adventures;
CREATE POLICY immerse_adventures_delete ON public.immerse_adventures
  FOR DELETE USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS immerse_stay_insert ON public.immerse_stay_requests;
CREATE POLICY immerse_stay_insert ON public.immerse_stay_requests
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS immerse_stay_select ON public.immerse_stay_requests;
CREATE POLICY immerse_stay_select ON public.immerse_stay_requests
  FOR SELECT USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS immerse_partners_insert ON public.immerse_park_partners;
CREATE POLICY immerse_partners_insert ON public.immerse_park_partners
  FOR INSERT WITH CHECK (true);

ALTER TABLE public.immerse_saved_sites ADD COLUMN IF NOT EXISTS youtube_url text;
ALTER TABLE public.immerse_saved_sites ADD COLUMN IF NOT EXISTS youtube_id text;
