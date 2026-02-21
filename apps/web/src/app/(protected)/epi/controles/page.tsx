'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Plus,
  ClipboardCheck,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEpiControles } from '@/hooks/useEpi';
import { EPI_CONTROLE_RESULTAT_LABELS } from '@conform-plus/shared';

const RESULTAT_COLORS: Record<string, string> = {
  conforme: 'bg-green-100 text-green-700 border-green-300',
  non_conforme: 'bg-red-100 text-red-700 border-red-300',
  a_surveiller: 'bg-orange-100 text-orange-700 border-orange-300',
};

export default function EpiControlesPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useEpiControles({ page, limit: 25 });
  const controles = data?.controles || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 25);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/epi" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">Controles EPI</h1>
          </div>
          <p className="text-xs text-muted-foreground ml-8">
            Historique des verifications periodiques
          </p>
        </div>
        <Link
          href="/epi/controles/new"
          className={cn(
            'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
            'hover:bg-primary/90 transition-colors',
          )}
        >
          <Plus className="h-4 w-4" />
          Nouveau controle
        </Link>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : controles.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Aucun controle</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Les verifications periodiques de vos EPI apparaitront ici.
          </p>
          <Link href="/epi/controles/new" className="btn-accent mt-4 inline-flex text-xs">
            <Plus className="h-3.5 w-3.5" />
            Nouveau controle
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Equipement</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Controleur</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Resultat</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Observations</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Prochain</th>
                </tr>
              </thead>
              <tbody>
                {controles.map((ctrl) => {
                  const epiItem = (ctrl as any).epi_items;
                  return (
                    <tr key={ctrl.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3 text-xs font-medium">
                        {new Date(ctrl.date_controle).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <Link
                          href={`/epi/inventaire/${ctrl.epi_item_id}`}
                          className="text-primary hover:underline"
                        >
                          {epiItem?.reference || ctrl.epi_item_id.slice(0, 8)}
                        </Link>
                        {epiItem?.epi_categories?.name && (
                          <span className="ml-1 text-muted-foreground">
                            ({epiItem.epi_categories.name})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{ctrl.controleur}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                            RESULTAT_COLORS[ctrl.resultat] || 'bg-gray-100 text-gray-600',
                          )}
                        >
                          {EPI_CONTROLE_RESULTAT_LABELS[ctrl.resultat] || ctrl.resultat}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                        {ctrl.observations || '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {ctrl.prochain_controle
                          ? new Date(ctrl.prochain_controle).toLocaleDateString('fr-FR')
                          : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Page {page} sur {totalPages} ({total} resultats)
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-md border px-3 py-1 text-xs disabled:opacity-50"
                >
                  Precedent
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border px-3 py-1 text-xs disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
