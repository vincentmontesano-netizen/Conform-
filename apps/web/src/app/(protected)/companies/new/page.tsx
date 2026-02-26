'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useCreateCompany, useAutoLinkCompany } from '@/hooks/useCompany';
import { SECTORS, createCompanySchema } from '@conform-plus/shared';
import { cn } from '@/lib/utils';
import { ZodError } from 'zod';

type FieldErrors = Record<string, string>;

export default function NewCompanyPage() {
  const router = useRouter();
  const createCompany = useCreateCompany();
  const autoLink = useAutoLinkCompany();

  const [autoLinkChecked, setAutoLinkChecked] = useState(false);
  const [autoLinkLoading, setAutoLinkLoading] = useState(true);
  const [name, setName] = useState('');
  const [siret, setSiret] = useState('');
  const [sector, setSector] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [hasPhysicalSite, setHasPhysicalSite] = useState(true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Auto-link: tente de lier une entreprise existante au profil utilisateur
  useEffect(() => {
    if (autoLinkChecked) return;
    setAutoLinkChecked(true);

    autoLink.mutateAsync()
      .then((result) => {
        if (result.linked && result.company_id) {
          // Entreprise trouvee et liee — rediriger vers le dashboard
          router.push('/dashboard');
          router.refresh();
        } else {
          setAutoLinkLoading(false);
        }
      })
      .catch(() => {
        setAutoLinkLoading(false);
      });
  }, [autoLinkChecked, autoLink, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setApiError(null);

    try {
      const data = createCompanySchema.parse({
        name,
        siret,
        sector,
        employee_count: employeeCount ? parseInt(employeeCount, 10) : 0,
        has_physical_site: hasPhysicalSite,
      });

      await createCompany.mutateAsync(data);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: FieldErrors = {};
        for (const issue of err.issues) {
          const field = issue.path[0] as string;
          if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        }
        setErrors(fieldErrors);
      } else {
        setApiError(err instanceof Error ? err.message : 'Erreur lors de la creation');
      }
    }
  }

  // Afficher un loader pendant la tentative d'auto-link
  if (autoLinkLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <span className="text-xs text-muted-foreground">Verification de votre compte...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/companies"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux entreprises
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Nouvelle entreprise</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Creez votre entreprise pour commencer a utiliser Conform+
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nom de l&apos;entreprise
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                errors.name && 'border-destructive'
              )}
              placeholder="Ex: Dupont Construction SARL"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* SIRET */}
          <div className="space-y-2">
            <label htmlFor="siret" className="text-sm font-medium">
              Numero SIRET
            </label>
            <input
              id="siret"
              type="text"
              value={siret}
              onChange={(e) => setSiret(e.target.value)}
              maxLength={14}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono',
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                errors.siret && 'border-destructive'
              )}
              placeholder="12345678901234"
            />
            {errors.siret && (
              <p className="text-sm text-destructive">{errors.siret}</p>
            )}
          </div>

          {/* Sector */}
          <div className="space-y-2">
            <label htmlFor="sector" className="text-sm font-medium">
              Secteur d&apos;activite
            </label>
            <select
              id="sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                !sector && 'text-muted-foreground',
                errors.sector && 'border-destructive'
              )}
            >
              <option value="">Selectionnez un secteur</option>
              {SECTORS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {errors.sector && (
              <p className="text-sm text-destructive">{errors.sector}</p>
            )}
          </div>

          {/* Employee count */}
          <div className="space-y-2">
            <label htmlFor="employee_count" className="text-sm font-medium">
              Nombre de salaries
            </label>
            <input
              id="employee_count"
              type="number"
              min="0"
              value={employeeCount}
              onChange={(e) => setEmployeeCount(e.target.value)}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                errors.employee_count && 'border-destructive'
              )}
              placeholder="0"
            />
            {errors.employee_count && (
              <p className="text-sm text-destructive">{errors.employee_count}</p>
            )}
          </div>

          {/* Has physical site */}
          <div className="flex items-center gap-2">
            <input
              id="has_physical_site"
              type="checkbox"
              checked={hasPhysicalSite}
              onChange={(e) => setHasPhysicalSite(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor="has_physical_site" className="text-sm font-medium">
              L&apos;entreprise possede un site physique
            </label>
          </div>

          {/* Server error */}
          {(apiError || createCompany.error) && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">
                {apiError ?? createCompany.error?.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={createCompany.isPending}
              className={cn(
                'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
                'hover:bg-primary/90 transition-colors',
                'disabled:opacity-50 disabled:pointer-events-none'
              )}
            >
              {createCompany.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Creer l&apos;entreprise
            </button>
            <Link
              href="/companies"
              className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
