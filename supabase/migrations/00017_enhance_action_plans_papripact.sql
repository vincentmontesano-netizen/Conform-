-- Migration 00017: Enhance action_plans with PAPRIPACT-specific fields

ALTER TABLE public.action_plans
  ADD COLUMN IF NOT EXISTS budget_estimate DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS resources TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'prevention',
  ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0
    CHECK (completion_percentage >= 0 AND completion_percentage <= 100);
