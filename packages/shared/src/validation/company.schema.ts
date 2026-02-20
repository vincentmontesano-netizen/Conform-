import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255),
  siret: z
    .string()
    .length(14, 'Le SIRET doit contenir 14 chiffres')
    .regex(/^\d{14}$/, 'Le SIRET ne doit contenir que des chiffres'),
  sector: z.string().min(1, 'Le secteur est requis'),
  employee_count: z.number().int().min(0, 'Nombre invalide'),
  has_physical_site: z.boolean().default(true),
});

export const updateCompanySchema = createCompanySchema.partial();

export const createSiteSchema = z.object({
  name: z.string().min(1, 'Le nom du site est requis').max(255),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  zip_code: z
    .string()
    .regex(/^\d{5}$/, 'Code postal invalide')
    .optional(),
  is_main: z.boolean().default(false),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CreateSiteInput = z.infer<typeof createSiteSchema>;
