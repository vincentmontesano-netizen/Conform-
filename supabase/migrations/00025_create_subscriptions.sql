-- Migration: Create subscriptions table
-- CONFORM+ — Liaison Companies <> Plans d'abonnement SaaS

CREATE TYPE public.subscription_plan AS ENUM ('basic', 'pro', 'premium', 'enterprise');
CREATE TYPE public.subscription_status AS ENUM ('active', 'trialing', 'canceled', 'past_due');

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id           UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan                 public.subscription_plan NOT NULL DEFAULT 'basic',
  status               public.subscription_status NOT NULL DEFAULT 'trialing',
  stripe_customer_id   TEXT,
  trial_ends_at        TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

CREATE INDEX idx_subscriptions_company_id ON public.subscriptions(company_id);
CREATE INDEX idx_subscriptions_plan ON public.subscriptions(plan);

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS: les membres d'une company peuvent lire leur abonnement
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company subscription"
  ON public.subscriptions
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Only super_admin can modify subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Auto-create a basic subscription when a new company is created
CREATE OR REPLACE FUNCTION public.handle_new_company_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (company_id, plan, status, trial_ends_at)
  VALUES (
    NEW.id,
    'basic',
    'trialing',
    now() + INTERVAL '14 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_company_created_create_subscription
  AFTER INSERT ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_company_subscription();

COMMENT ON TABLE public.subscriptions IS 'Abonnements SaaS par entreprise (plan Basic/Pro/Premium/Enterprise)';
