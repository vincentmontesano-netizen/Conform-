'use client';

import {
  GraduationCap,
  BadgeCheck,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FormationStats } from '@conform-plus/shared';

interface FormationStatCardsProps {
  stats: FormationStats;
}

export function FormationStatCards({ stats }: FormationStatCardsProps) {
  const cards = [
    {
      label: 'Salaries suivis',
      value: stats.total_salaries,
      icon: Users,
      accent: false,
    },
    {
      label: 'Formations a jour',
      value: stats.formations_valid,
      icon: GraduationCap,
      accent: false,
    },
    {
      label: 'Habilitations a jour',
      value: stats.habilitations_valid,
      icon: BadgeCheck,
      accent: false,
    },
    {
      label: 'A renouveler',
      value: stats.formations_expiring + stats.habilitations_expiring,
      sub: 'dans les 30 jours',
      icon: AlertTriangle,
      accent: true,
    },
    {
      label: 'Expirees',
      value: stats.formations_expired + stats.habilitations_expired,
      icon: AlertTriangle,
      accent: true,
    },
    {
      label: 'Obligatoires manquantes',
      value: stats.obligatoires_manquantes,
      icon: AlertTriangle,
      accent: true,
    },
  ];

  return (
    <div className="stagger-in grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const isWarning = card.accent && card.value > 0;
        return (
          <div
            key={card.label}
            className={cn(
              'card-accent rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md',
              isWarning && 'border-destructive/20',
            )}
          >
            <div className="flex items-center gap-2.5">
              <card.icon
                className={cn(
                  'h-4 w-4',
                  isWarning ? 'text-destructive' : 'text-muted-foreground/60',
                )}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {card.label}
              </span>
            </div>
            <p
              className={cn(
                'mt-3 text-3xl font-bold tracking-tight',
                isWarning && 'text-destructive',
              )}
            >
              {card.value}
            </p>
            {card.sub && (
              <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
