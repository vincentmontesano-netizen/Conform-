'use client';

import Link from 'next/link';
import { FileText, Plus, Loader2 } from 'lucide-react';
import { useDuerps } from '@/hooks/useDuerp';
import { useCompanies } from '@/hooks/useCompany';
import { DUERP_STATUS_LABELS } from '@conform-plus/shared';
import type { DuerpStatus } from '@conform-plus/shared';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<DuerpStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-300',
  pending_validation: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  validated: 'bg-green-100 text-green-700 border-green-300',
  archived: 'bg-gray-100 text-gray-500 border-gray-300',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function DuerpListPage() {
  const { data: duerps, isLoading, error } = useDuerps();
  const { data: companies } = useCompanies();

  function getCompanyName(companyId: string): string {
    const company = companies?.find((c) => c.id === companyId);
    return company?.name ?? 'Entreprise inconnue';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents Uniques (DUERP)</h1>
          <p className="text-sm text-muted-foreground">
            Gerez vos Documents Uniques d'Evaluation des Risques Professionnels.
          </p>
        </div>
        <Link
          href="/duerp/new"
          className={cn(
            'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
            'hover:bg-primary/90 transition-colors'
          )}
        >
          <Plus className="h-4 w-4" />
          Nouveau DUERP
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
            Erreur lors du chargement des DUERP : {error.message}
          </p>
        </div>
      )}

      {!isLoading && !error && duerps && duerps.length === 0 && (
        <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold">Aucun DUERP</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Creez votre premier Document Unique pour evaluer les risques professionnels.
          </p>
          <Link
            href="/duerp/new"
            className={cn(
              'mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
              'hover:bg-primary/90 transition-colors'
            )}
          >
            <Plus className="h-4 w-4" />
            Creer un DUERP
          </Link>
        </div>
      )}

      {!isLoading && !error && duerps && duerps.length > 0 && (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Entreprise
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Site
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Version
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Date creation
                  </th>
                </tr>
              </thead>
              <tbody>
                {duerps.map((duerp) => (
                  <tr
                    key={duerp.id}
                    className="border-b transition-colors hover:bg-muted/50 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/duerp/${duerp.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {getCompanyName(duerp.company_id)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {duerp.site_id ? duerp.site_id : 'Tous les sites'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                          STATUS_COLORS[duerp.status]
                        )}
                      >
                        {DUERP_STATUS_LABELS[duerp.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      v{duerp.current_version}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(duerp.created_at)}
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
