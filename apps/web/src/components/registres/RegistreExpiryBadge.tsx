'use client';

import { cn } from '@/lib/utils';

interface RegistreExpiryBadgeProps {
  expiresAt: string | null;
  className?: string;
}

export function RegistreExpiryBadge({ expiresAt, className }: RegistreExpiryBadgeProps) {
  if (!expiresAt) return null;

  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let label: string;
  let colorClasses: string;

  if (diffDays < 0) {
    label = `Expire (${Math.abs(diffDays)}j)`;
    colorClasses = 'bg-red-100 text-red-700 border-red-300';
  } else if (diffDays <= 30) {
    label = `${diffDays}j restants`;
    colorClasses = 'bg-orange-100 text-orange-700 border-orange-300';
  } else {
    label = `Valide (${diffDays}j)`;
    colorClasses = 'bg-green-100 text-green-700 border-green-300';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
        colorClasses,
        className
      )}
    >
      {label}
    </span>
  );
}
