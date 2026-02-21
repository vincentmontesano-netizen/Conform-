'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  ArrowLeft,
  Table2,
  Filter,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConformiteMatrix } from '@/hooks/useFormation';
import { ConformiteMatrix } from '@/components/formations/ConformiteMatrix';
import type { ConformiteStatus, ConformiteFilters } from '@conform-plus/shared';

export default function ConformitePage() {
  const [filters, setFilters] = useState<ConformiteFilters>({});
  const { data: matrix, isLoading } = useConformiteMatrix(filters);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <span className="text-xs text-muted-foreground">Calcul de la matrice...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/formations"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Matrice de conformite</h1>
            <p className="text-xs text-muted-foreground">
              Vue croisee salaries x formations / habilitations
            </p>
          </div>
        </div>
        <Link
          href="/formations/rapport"
          className={cn(
            'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
            'hover:bg-primary/90 transition-colors',
          )}
        >
          <FileText className="h-4 w-4" />
          Rapport inspection
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground">Filtres :</span>

        {/* Category filter */}
        <select
          value={filters.category || ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              category: (e.target.value || undefined) as 'formation' | 'habilitation' | undefined,
            }))
          }
          className="rounded-md border bg-background px-2 py-1 text-xs"
        >
          <option value="">Toutes les categories</option>
          <option value="formation">Formations</option>
          <option value="habilitation">Habilitations</option>
        </select>

        {/* Status filter */}
        <select
          value={filters.status || ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              status: (e.target.value || undefined) as ConformiteStatus | undefined,
            }))
          }
          className="rounded-md border bg-background px-2 py-1 text-xs"
        >
          <option value="">Tous les statuts</option>
          <option value="valid">A jour</option>
          <option value="expiring">Expire bientot</option>
          <option value="expired">Expire</option>
          <option value="missing">Manquant</option>
        </select>

        {/* Obligatoire only */}
        <label className="flex items-center gap-1.5 text-xs">
          <input
            type="checkbox"
            checked={filters.obligatoire_only || false}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                obligatoire_only: e.target.checked || undefined,
              }))
            }
            className="rounded border"
          />
          Obligatoires uniquement
        </label>

        {/* Search */}
        <input
          type="text"
          placeholder="Rechercher un salarie..."
          value={filters.search || ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              search: e.target.value || undefined,
            }))
          }
          className="ml-auto rounded-md border bg-background px-3 py-1 text-xs w-48"
        />
      </div>

      {/* Summary */}
      {matrix && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{matrix.summary.total_employees} salarie(s)</span>
          <span className="text-green-600">{matrix.summary.valid_cells} a jour</span>
          <span className="text-orange-600">{matrix.summary.expiring_cells} expirant</span>
          <span className="text-red-600">{matrix.summary.expired_cells} expire(s)</span>
          <span className="text-gray-500">{matrix.summary.missing_cells} manquant(s)</span>
          <span className="ml-auto font-semibold">
            Score global : {matrix.summary.global_score}%
          </span>
        </div>
      )}

      {/* Matrix */}
      {matrix && <ConformiteMatrix matrix={matrix} />}
    </div>
  );
}
