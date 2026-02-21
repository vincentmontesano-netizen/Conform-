import { z } from 'zod';

// ============================================================
// Formation Types
// ============================================================

export const createFormationTypeSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  category: z.enum(['formation', 'habilitation']),
  description: z.string().max(1000).optional(),
  duree_validite_mois: z.number().int().min(0).optional(),
  norme: z.string().max(255).optional(),
  is_obligatoire: z.boolean().optional(),
  match_registre_type: z.enum(['formations', 'habilitations']),
  match_field_value: z.string().min(1).max(100),
});

export const updateFormationTypeSchema = z.object({
  code: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(255).optional(),
  category: z.enum(['formation', 'habilitation']).optional(),
  description: z.string().max(1000).optional().nullable(),
  duree_validite_mois: z.number().int().min(0).optional().nullable(),
  norme: z.string().max(255).optional().nullable(),
  is_obligatoire: z.boolean().optional(),
  match_registre_type: z.enum(['formations', 'habilitations']).optional(),
  match_field_value: z.string().min(1).max(100).optional(),
  is_active: z.boolean().optional(),
});

// ============================================================
// Inferred types
// ============================================================

export type CreateFormationTypeInput = z.infer<typeof createFormationTypeSchema>;
export type UpdateFormationTypeInput = z.infer<typeof updateFormationTypeSchema>;
