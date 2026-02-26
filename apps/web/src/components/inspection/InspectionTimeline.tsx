'use client';

import { Calendar, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InspectionDeadline } from '@conform-plus/shared';

interface Props {
  deadlines: InspectionDeadline[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function daysUntil(dateStr: string) {
  const diff = Math.floor(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (diff < 0) return `${Math.abs(diff)}j en retard`;
  if (diff === 0) return "Aujourd'hui";
  return `Dans ${diff}j`;
}

const MODULE_COLORS: Record<string, string> = {
  duerp: 'bg-blue-500/10 text-blue-400',
  registres: 'bg-purple-500/10 text-purple-400',
  epi: 'bg-amber-500/10 text-amber-400',
  formations: 'bg-emerald-500/10 text-emerald-400',
};

export function InspectionTimeline({ deadlines }: Props) {
  if (deadlines.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <Calendar className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">
          Aucune echeance critique dans les 30 prochains jours
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Echeances critiques (30 jours)
        </h3>
      </div>
      <div className="divide-y">
        {deadlines.map((deadline) => {
          const isOverdue = new Date(deadline.date) < new Date();
          return (
            <div key={deadline.id} className="flex items-center gap-3 px-4 py-3">
              {deadline.severity === 'critical' ? (
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{deadline.label}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={cn(
                      'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                      MODULE_COLORS[deadline.module] || 'bg-muted text-muted-foreground',
                    )}
                  >
                    {deadline.module.toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(deadline.date)}
                  </span>
                </div>
              </div>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isOverdue ? 'text-red-400' : 'text-muted-foreground',
                )}
              >
                {daysUntil(deadline.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
