-- Migration: Create action plans table (PAPRIPACT)
-- CONFORM+ - Plan d'actions de prevention

CREATE TYPE public.action_priority AS ENUM ('faible', 'moyenne', 'haute', 'urgente');
CREATE TYPE public.action_status AS ENUM ('a_faire', 'en_cours', 'terminee', 'annulee');

CREATE TABLE IF NOT EXISTS public.action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duerp_id UUID NOT NULL REFERENCES public.duerp_documents(id) ON DELETE CASCADE,
  risk_id UUID REFERENCES public.risks(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  priority public.action_priority NOT NULL DEFAULT 'moyenne',
  responsible TEXT,
  deadline DATE,
  status public.action_status NOT NULL DEFAULT 'a_faire',
  is_critical BOOLEAN NOT NULL DEFAULT false,
  has_proof BOOLEAN NOT NULL DEFAULT false,
  proof_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_action_plans_duerp ON public.action_plans(duerp_id);
CREATE INDEX idx_action_plans_critical ON public.action_plans(is_critical) WHERE is_critical = true;

CREATE TRIGGER update_action_plans_updated_at
  BEFORE UPDATE ON public.action_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.action_plans IS 'PAPRIPACT - Plan d''actions de prevention des risques';
