'use client';

import { cn } from '@/lib/utils';

interface EpiExpiryBadgeProps {
  date: string | null;
  label?: string;
  className?: string;
}

export function EpiExpiryBadge({ date, label, className }: EpiExpiryBadgeProps) {
  if (!date) return null;

  const now = new Date();
  const expiry = new Date(date);
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let text: string;
  let colorClasses: string;

  if (diffDays < 0) {
    text = label ? `${label} expire (${Math.abs(diffDays)}j)` : `Expire (${Math.abs(diffDays)}j)`;
    colorClasses = 'bg-red-100 text-red-700 border-red-300';
  } else if (diffDays <= 30) {
    text = label ? `${label} ${diffDays}j` : `${diffDays}j restants`;
    colorClasses = 'bg-orange-100 text-orange-700 border-orange-300';
  } else {
    text = label ? `${label} OK` : `Valide (${diffDays}j)`;
    colorClasses = 'bg-green-100 text-green-700 border-green-300';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
        colorClasses,
        className,
      )}
    >
      {text}
    </span>
  );
}
