'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Plus,
  HardHat,
  ArrowLeft,
  Eye,
} from 'lucide-react';
import { useEpiItems, useEpiCategories } from '@/hooks/useEpi';
import { EpiStatutBadge } from '@/components/epi/EpiStatutBadge';
import { EpiEtatBadge } from '@/components/epi/EpiEtatBadge';
import { EpiExpiryBadge } from '@/components/epi/EpiExpiryBadge';
import { EPI_STATUT_LABELS, EPI_ETAT_LABELS } from '@conform-plus/shared';

interface EpiInventaireClientProps {
  initialCategory?: string;
  initialEtat?: string;
}

export default function EpiInventaireClient({ initialCategory = '', initialEtat = '' }: EpiInventaireClientProps) {
  const [filters, setFilters] = useState({
    statut: '',
    etat: initialEtat,
    category_id: initialCategory,
    page: 1,
  });

  const { data, isLoading } = useEpiItems({
    statut: filters.statut || undefined,
    etat: filters.etat || undefined,
    category_id: filters.category_id || undefined,
    page: filters.page,
    limit: 25,
  });
  const { data: categories } = useEpiCategories();

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 25);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/epi" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">Inventaire EPI</h1>
          </div>
          <p className="text-xs text-muted-foreground ml-8">
            {total} equipement(s) au total
          </p>
        </div>
        <Link
          href="/epi/inventaire/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvel EPI
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filters.category_id}
          onChange={(e) => setFilters((f) => ({ ...f, category_id: e.target.value, page: 1 }))}
          className="rounded-md border bg-background px-3 py-1.5 text-xs"
        >
          <option value="">Toutes categories</option>
          {(categories || []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={filters.statut}
          onChange={(e) => setFilters((f) => ({ ...f, statut: e.target.value, page: 1 }))}
          className="rounded-md border bg-background px-3 py-1.5 text-xs"
        >
          <option value="">Tous statuts</option>
          {Object.entries(EPI_STATUT_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={filters.etat}
          onChange={(e) => setFilters((f) => ({ ...f, etat: e.target.value, page: 1 }))}
          className="rounded-md border bg-background px-3 py-1.5 text-xs"
        >
          <option value="">Tous etats</option>
          {Object.entries(EPI_ETAT_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
        {(filters.statut || filters.etat || filters.category_id) && (
          <button
            onClick={() => setFilters({ statut: '', etat: '', category_id: '', page: 1 })}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Reinitialiser
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <HardHat className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Aucun equipement</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Ajoutez votre premier EPI pour commencer le suivi.
          </p>
          <Link href="/epi/inventaire/new" className="btn-accent mt-4 inline-flex text-xs">
            <Plus className="h-3.5 w-3.5" />
            Ajouter un EPI
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Reference</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categorie</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Taille</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Etat</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Peremption</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Prochain controle</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">
                      {item.reference || item.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {(item as { epi_categories?: { name: string } }).epi_categories?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{item.taille || '-'}</td>
                    <td className="px-4 py-3">
                      <EpiStatutBadge statut={item.statut} />
                    </td>
                    <td className="px-4 py-3">
                      <EpiEtatBadge etat={item.etat} />
                    </td>
                    <td className="px-4 py-3">
                      <EpiExpiryBadge date={item.date_expiration} />
                    </td>
                    <td className="px-4 py-3">
                      <EpiExpiryBadge date={item.date_prochain_controle} label="Ctrl" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/epi/inventaire/${item.id}`}
                        className="inline-flex gap-1 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Page {filters.page} sur {totalPages} ({total} resultats)
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={filters.page <= 1}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                  className="rounded-md border px-3 py-1 text-xs disabled:opacity-50"
                >
                  Precedent
                </button>
                <button
                  disabled={filters.page >= totalPages}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
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
