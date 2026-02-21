'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Plus,
  Users,
  ArrowLeft,
  Search,
  ArrowLeftRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEpiAttributions, useUpdateEpiAttribution } from '@/hooks/useEpi';

export default function EpiAttributionsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useEpiAttributions({
    salarie_nom: search || undefined,
    page,
    limit: 25,
  });

  const updateAttribution = useUpdateEpiAttribution();
  const attributions = data?.attributions || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 25);

  const handleRetour = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    updateAttribution.mutate({ id, date_retour: today });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/epi" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">Attributions EPI</h1>
          </div>
          <p className="text-xs text-muted-foreground ml-8">
            Historique de toutes les remises d&apos;EPI aux salaries
          </p>
        </div>
        <Link
          href="/epi/attributions/new"
          className={cn(
            'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
            'hover:bg-primary/90 transition-colors',
          )}
        >
          <Plus className="h-4 w-4" />
          Nouvelle attribution
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher par nom de salarie..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-md border bg-background pl-10 pr-3 py-2 text-sm"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : attributions.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Aucune attribution</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Les remises d&apos;EPI aux salaries apparaitront ici.
          </p>
          <Link href="/epi/attributions/new" className="btn-accent mt-4 inline-flex text-xs">
            <Plus className="h-3.5 w-3.5" />
            Nouvelle attribution
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Salarie</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Poste</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Equipement</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date attribution</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Retour</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Attribue par</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attributions.map((attr) => {
                  const epiItem = (attr as any).epi_items;
                  const isActive = !attr.date_retour;
                  return (
                    <tr
                      key={attr.id}
                      className={cn(
                        'border-b transition-colors hover:bg-muted/50',
                        !isActive && 'opacity-60',
                      )}
                    >
                      <td className="px-4 py-3 font-medium">{attr.salarie_nom}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {attr.salarie_poste || '-'}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {epiItem?.reference || '-'}{' '}
                        <span className="text-muted-foreground">
                          {epiItem?.epi_categories?.name ? `(${epiItem.epi_categories.name})` : ''}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {new Date(attr.date_attribution).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {attr.date_retour ? (
                          new Date(attr.date_retour).toLocaleDateString('fr-FR')
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                            En cours
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{attr.attribue_par}</td>
                      <td className="px-4 py-3 text-right">
                        {isActive && (
                          <button
                            onClick={() => handleRetour(attr.id)}
                            disabled={updateAttribution.isPending}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title="Enregistrer le retour"
                          >
                            <ArrowLeftRight className="h-3 w-3" />
                            Retour
                          </button>
                        )}
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
