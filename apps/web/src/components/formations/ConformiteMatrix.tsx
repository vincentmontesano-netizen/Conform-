'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ConformiteBadge } from './ConformiteBadge';
import type { ConformiteMatrix as ConformiteMatrixType } from '@conform-plus/shared';

interface ConformiteMatrixProps {
  matrix: ConformiteMatrixType;
}

export function ConformiteMatrix({ matrix }: ConformiteMatrixProps) {
  const [sortBy, setSortBy] = useState<'name' | 'score'>('name');

  if (matrix.rows.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Aucune donnee de conformite disponible. Ajoutez des entrees dans les registres formations et habilitations.
        </p>
      </div>
    );
  }

  const sortedRows = [...matrix.rows].sort((a, b) => {
    if (sortBy === 'score') return a.score - b.score;
    return a.salarie_nom.localeCompare(b.salarie_nom, 'fr');
  });

  return (
    <div className="space-y-3">
      {/* Sort controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Trier par :</span>
        <button
          onClick={() => setSortBy('name')}
          className={cn(
            'rounded px-2 py-1 text-xs font-medium transition-colors',
            sortBy === 'name'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80',
          )}
        >
          Nom
        </button>
        <button
          onClick={() => setSortBy('score')}
          className={cn(
            'rounded px-2 py-1 text-xs font-medium transition-colors',
            sortBy === 'score'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80',
          )}
        >
          Score
        </button>
      </div>

      {/* Matrix table */}
      <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 border-b border-r bg-gray-50 px-3 py-2 text-left font-semibold">
                Salarie
              </th>
              <th className="border-b border-r bg-gray-50 px-2 py-2 text-center font-semibold">
                Score
              </th>
              {matrix.columns.map((col: any) => (
                <th
                  key={col.id}
                  className="border-b bg-gray-50 px-1.5 py-2 text-center font-semibold"
                  title={`${col.name} — ${col.norme || ''}`}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="whitespace-nowrap">{col.code}</span>
                    {col.is_obligatoire && (
                      <span className="text-[8px] font-bold text-red-500">OBLIG.</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr key={row.salarie_nom} className="hover:bg-muted/30 transition-colors">
                <td className="sticky left-0 z-10 border-b border-r bg-white px-3 py-2">
                  <div>
                    <p className="font-medium text-foreground">{row.salarie_nom}</p>
                    {row.salarie_poste && (
                      <p className="text-[10px] text-muted-foreground">{row.salarie_poste}</p>
                    )}
                  </div>
                </td>
                <td className="border-b border-r px-2 py-2 text-center">
                  <span
                    className={cn(
                      'inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold',
                      row.score >= 80
                        ? 'bg-green-100 text-green-800'
                        : row.score >= 50
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800',
                    )}
                  >
                    {row.score}
                  </span>
                </td>
                {row.cells.map((cell) => (
                  <td key={cell.formation_type_id} className="border-b px-1.5 py-2 text-center">
                    <ConformiteBadge
                      status={cell.status}
                      daysRemaining={cell.days_remaining}
                      compact
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
        <span className="font-semibold">Legende :</span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border bg-green-100 border-green-200" />
          A jour
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border bg-orange-100 border-orange-200" />
          Expire bientot
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border bg-red-100 border-red-200" />
          Expire
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border bg-gray-100 border-gray-200" />
          Manquant
        </span>
      </div>
    </div>
  );
}
