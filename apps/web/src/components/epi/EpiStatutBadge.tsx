'use client';

import { cn } from '@/lib/utils';
import { EPI_STATUT_LABELS } from '@conform-plus/shared';

const STATUT_COLORS: Record<string, string> = {
  en_stock: 'bg-green-100 text-green-700 border-green-300',
  attribue: 'bg-blue-100 text-blue-700 border-blue-300',
  en_controle: 'bg-amber-100 text-amber-700 border-amber-300',
  retire: 'bg-gray-100 text-gray-500 border-gray-300',
  perdu: 'bg-red-100 text-red-700 border-red-300',
};

interface EpiStatutBadgeProps {
  statut: string;
  className?: string;
}

export function EpiStatutBadge({ statut, className }: EpiStatutBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
        STATUT_COLORS[statut] || 'bg-gray-100 text-gray-600 border-gray-200',
        className,
      )}
    >
      {EPI_STATUT_LABELS[statut] || statut}
    </span>
  );
}
