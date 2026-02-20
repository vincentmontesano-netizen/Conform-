'use client';

import Link from 'next/link';
import { Building2, Plus, Loader2 } from 'lucide-react';
import { useCompanies } from '@/hooks/useCompany';
import { SECTORS } from '@conform-plus/shared';
import { cn } from '@/lib/utils';

function getSectorLabel(value: string): string {
  const sector = SECTORS.find((s) => s.value === value);
  return sector?.label ?? value;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function CompaniesPage() {
  const { data: companies, isLoading, error } = useCompanies();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Entreprises</h1>
          <p className="text-sm text-muted-foreground">
            Gerez vos entreprises et leurs sites.
          </p>
        </div>
        <Link
          href="/companies/new"
          className={cn(
            'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
            'hover:bg-primary/90 transition-colors'
          )}
        >
          <Plus className="h-4 w-4" />
          Nouvelle entreprise
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Erreur lors du chargement des entreprises : {error.message}
          </p>
        </div>
      )}

      {!isLoading && !error && companies && companies.length === 0 && (
        <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold">Aucune entreprise</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Commencez par creer votre premiere entreprise.
          </p>
          <Link
            href="/companies/new"
            className={cn(
              'mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
              'hover:bg-primary/90 transition-colors'
            )}
          >
            <Plus className="h-4 w-4" />
            Creer une entreprise
          </Link>
        </div>
      )}

      {!isLoading && !error && companies && companies.length > 0 && (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Nom
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    SIRET
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Secteur
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Effectifs
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Date creation
                  </th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr
                    key={company.id}
                    className="border-b transition-colors hover:bg-muted/50 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/companies/${company.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {company.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {company.siret}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {getSectorLabel(company.sector)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {company.employee_count}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(company.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
