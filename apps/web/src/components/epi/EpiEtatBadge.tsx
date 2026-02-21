'use client';

import { cn } from '@/lib/utils';
import { EPI_ETAT_LABELS } from '@conform-plus/shared';

const ETAT_COLORS: Record<string, string> = {
  neuf: 'bg-green-100 text-green-700 border-green-300',
  bon: 'bg-blue-100 text-blue-700 border-blue-300',
  usage: 'bg-orange-100 text-orange-700 border-orange-300',
  a_remplacer: 'bg-red-100 text-red-700 border-red-300',
  retire: 'bg-gray-100 text-gray-500 border-gray-300',
};

interface EpiEtatBadgeProps {
  etat: string;
  className?: string;
}

export function EpiEtatBadge({ etat, className }: EpiEtatBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
        ETAT_COLORS[etat] || 'bg-gray-100 text-gray-600 border-gray-200',
        className,
      )}
    >
      {EPI_ETAT_LABELS[etat] || etat}
    </span>
  );
}
