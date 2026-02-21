import { z } from 'zod';

// ============================================================
// Categories
// ============================================================

export const createEpiCategorySchema = z.object({
  name: z.string().min(1).max(255),
  code: z.string().max(50).optional(),
  description: z.string().max(1000).optional(),
  norme: z.string().max(100).optional(),
  duree_vie_mois: z.number().int().positive().optional(),
  controle_periodique_mois: z.number().int().positive().optional(),
});

export const updateEpiCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  code: z.string().max(50).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  norme: z.string().max(100).optional().nullable(),
  duree_vie_mois: z.number().int().positive().optional().nullable(),
  controle_periodique_mois: z.number().int().positive().optional().nullable(),
  is_active: z.boolean().optional(),
});

// ============================================================
// Items
// ============================================================

export const createEpiItemSchema = z.object({
  category_id: z.string().uuid(),
  site_id: z.string().uuid().optional().nullable(),
  reference: z.string().max(255).optional(),
  taille: z.string().max(50).optional(),
  date_achat: z.string().optional(),
  date_fabrication: z.string().optional().nullable(),
  date_expiration: z.string().optional().nullable(),
  date_mise_en_service: z.string().optional().nullable(),
  etat: z.enum(['neuf', 'bon', 'usage', 'a_remplacer', 'retire']).optional(),
  statut: z.enum(['en_stock', 'attribue', 'en_controle', 'retire', 'perdu']).optional(),
  quantite: z.number().int().positive().optional(),
  notes: z.string().max(2000).optional(),
});

export const updateEpiItemSchema = createEpiItemSchema.partial();

// ============================================================
// Attributions
// ============================================================

export const createEpiAttributionSchema = z.object({
  epi_item_id: z.string().uuid(),
  salarie_nom: z.string().min(1).max(255),
  salarie_poste: z.string().max(255).optional(),
  date_attribution: z.string(),
  date_retour: z.string().optional().nullable(),
  motif: z.string().max(500).optional(),
  attribue_par: z.string().min(1).max(255),
  signature_salarie: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
});

// ============================================================
// Controles
// ============================================================

export const createEpiControleSchema = z.object({
  epi_item_id: z.string().uuid(),
  date_controle: z.string(),
  controleur: z.string().min(1).max(255),
  resultat: z.enum(['conforme', 'non_conforme', 'a_surveiller']),
  observations: z.string().max(2000).optional(),
  prochain_controle: z.string().optional().nullable(),
});

// ============================================================
// Inferred types
// ============================================================

export type CreateEpiCategoryInput = z.infer<typeof createEpiCategorySchema>;
export type UpdateEpiCategoryInput = z.infer<typeof updateEpiCategorySchema>;
export type CreateEpiItemInput = z.infer<typeof createEpiItemSchema>;
export type UpdateEpiItemInput = z.infer<typeof updateEpiItemSchema>;
export type CreateEpiAttributionInput = z.infer<typeof createEpiAttributionSchema>;
export type CreateEpiControleInput = z.infer<typeof createEpiControleSchema>;
