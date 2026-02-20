import { z } from 'zod';

export const createWorkUnitSchema = z.object({
  name: z.string().min(1, 'Le nom de l\'unite de travail est requis').max(255),
  description: z.string().max(1000).optional(),
});

export const createRiskSchema = z.object({
  category: z.string().min(1, 'La categorie de risque est requise'),
  description: z.string().min(1, 'La description du risque est requise').max(2000),
  severity: z.enum(['faible', 'modere', 'eleve', 'critique']),
  probability: z.enum(['improbable', 'peu_probable', 'probable', 'tres_probable']),
  existing_measures: z.string().max(2000).optional(),
  is_rps: z.boolean().default(false),
});

export const createActionPlanSchema = z.object({
  name: z.string().min(1, 'Le nom de l\'action est requis').max(255),
  description: z.string().max(2000).optional(),
  priority: z.enum(['faible', 'moyenne', 'haute', 'urgente']).default('moyenne'),
  responsible: z.string().max(255).optional(),
  deadline: z.string().optional(),
  is_critical: z.boolean().default(false),
});

export const updateActionPlanSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  priority: z.enum(['faible', 'moyenne', 'haute', 'urgente']).optional(),
  responsible: z.string().max(255).optional(),
  deadline: z.string().optional(),
  status: z.enum(['a_faire', 'en_cours', 'terminee', 'annulee']).optional(),
  is_critical: z.boolean().optional(),
  has_proof: z.boolean().optional(),
  proof_url: z.string().url().optional(),
});

export type CreateWorkUnitInput = z.infer<typeof createWorkUnitSchema>;
export type CreateRiskInput = z.infer<typeof createRiskSchema>;
export type CreateActionPlanInput = z.infer<typeof createActionPlanSchema>;
export type UpdateActionPlanInput = z.infer<typeof updateActionPlanSchema>;
