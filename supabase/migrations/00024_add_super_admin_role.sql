-- Migration: Add super_admin role
-- CONFORM+ — Rôle super_admin pour le portail back-office

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'super_admin';

COMMENT ON TYPE public.user_role IS 'Rôles utilisateurs: admin (company admin), rh, manager, inspecteur, super_admin (plateforme)';
