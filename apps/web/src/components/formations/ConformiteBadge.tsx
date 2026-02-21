'use client';

import { cn } from '@/lib/utils';
import type { ConformiteStatus } from '@conform-plus/shared';

const statusConfig: Record<
  ConformiteStatus,
  { label: string; className: string; shortLabel: string }
> = {
  valid: {
    label: 'A jour',
    shortLabel: 'OK',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  expiring: {
    label: 'Expire bientot',
    shortLabel: '⚠',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  expired: {
    label: 'Expire',
    shortLabel: '✗',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  missing: {
    label: 'Manquant',
    shortLabel: '—',
    className: 'bg-gray-100 text-gray-500 border-gray-200',
  },
};

interface ConformiteBadgeProps {
  status: ConformiteStatus;
  daysRemaining?: number | null;
  compact?: boolean;
  className?: string;
}

export function ConformiteBadge({ status, daysRemaining, compact, className }: ConformiteBadgeProps) {
  const config = statusConfig[status];

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex h-7 w-7 items-center justify-center rounded border text-xs font-bold',
          config.className,
          className,
        )}
        title={`${config.label}${daysRemaining != null ? ` (${daysRemaining}j)` : ''}`}
      >
        {config.shortLabel}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
        config.className,
        className,
      )}
    >
      {config.label}
      {daysRemaining != null && status !== 'missing' && (
        <span className="opacity-70">({daysRemaining}j)</span>
      )}
    </span>
  );
}
