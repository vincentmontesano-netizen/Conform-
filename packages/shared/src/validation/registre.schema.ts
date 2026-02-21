import { z } from 'zod';

export const createRegistreSchema = z.object({
  type: z.enum([
    'rup', 'controles_securite', 'accidents_benins', 'dangers_graves',
    'formations', 'habilitations', 'erp_icpe', 'rgpd',
  ]),
  name: z.string().min(1, 'Le nom est requis').max(255),
  description: z.string().max(1000).optional(),
  site_id: z.string().uuid().optional().nullable(),
});

export const updateRegistreSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
  is_active: z.boolean().optional(),
});

export const createRegistreEntrySchema = z.object({
  data: z.record(z.unknown()),
  expires_at: z.string().optional().nullable(),
});

export const updateRegistreEntrySchema = z.object({
  data: z.record(z.unknown()).optional(),
  expires_at: z.string().optional().nullable(),
  is_archived: z.boolean().optional(),
});

export type CreateRegistreInput = z.infer<typeof createRegistreSchema>;
export type UpdateRegistreInput = z.infer<typeof updateRegistreSchema>;
export type CreateRegistreEntryInput = z.infer<typeof createRegistreEntrySchema>;
export type UpdateRegistreEntryInput = z.infer<typeof updateRegistreEntrySchema>;
