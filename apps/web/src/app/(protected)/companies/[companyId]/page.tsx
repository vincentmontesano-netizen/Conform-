'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Building2, MapPin, Pencil, Plus, ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { useCompany, useDeleteCompany } from '@/hooks/useCompany';
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

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const router = useRouter();
  const { data: company, isLoading, error } = useCompany(companyId);
  const deleteCompany = useDeleteCompany();

  async function handleDelete() {
    if (!confirm('Etes-vous sur de vouloir supprimer cette entreprise ? Cette action est irreversible.')) {
      return;
    }
    await deleteCompany.mutateAsync(companyId);
    router.push('/companies');
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          href="/companies"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux entreprises
        </Link>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Erreur lors du chargement : {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!company) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/companies"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux entreprises
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">{company.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/companies/${companyId}/edit`}
              className={cn(
                'inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium',
                'hover:bg-muted transition-colors'
              )}
            >
              <Pencil className="h-4 w-4" />
              Modifier
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleteCompany.isPending}
              className={cn(
                'inline-flex items-center gap-2 rounded-md border border-destructive/50 bg-background px-4 py-2 text-sm font-medium text-destructive',
                'hover:bg-destructive/10 transition-colors',
                'disabled:opacity-50 disabled:pointer-events-none'
              )}
            >
              {deleteCompany.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Company Info Card */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-medium text-muted-foreground">
          Informations generales
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">SIRET</p>
            <p className="mt-1 font-mono text-sm">{company.siret}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Secteur</p>
            <p className="mt-1 text-sm">{getSectorLabel(company.sector)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Effectifs</p>
            <p className="mt-1 text-sm">
              {company.employee_count} salarie{company.employee_count > 1 ? 's' : ''}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Site physique</p>
            <p className="mt-1 text-sm">
              {company.has_physical_site ? 'Oui' : 'Non'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Date de creation</p>
            <p className="mt-1 text-sm">{formatDate(company.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Sites Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Sites
          </h2>
          <Link
            href={`/companies/${companyId}/sites/new`}
            className={cn(
              'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
              'hover:bg-primary/90 transition-colors'
            )}
          >
            <Plus className="h-4 w-4" />
            Ajouter un site
          </Link>
        </div>

        {company.sites && company.sites.length === 0 && (
          <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
            <MapPin className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              Aucun site enregistre pour cette entreprise.
            </p>
          </div>
        )}

        {company.sites && company.sites.length > 0 && (
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Nom
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Adresse
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Ville
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Code postal
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Site principal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {company.sites.map((site) => (
                    <tr
                      key={site.id}
                      className="border-b transition-colors hover:bg-muted/50 last:border-0"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/companies/${companyId}/sites/${site.id}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {site.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {site.address || '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {site.city || '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">
                        {site.zip_code || '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {site.is_main ? (
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Principal
                          </span>
                        ) : (
                          'Non'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
