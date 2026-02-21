'use client';

import { Users, ClipboardCheck, ArrowLeftRight, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EPI_CONTROLE_RESULTAT_LABELS } from '@conform-plus/shared';
import type { EpiAttribution, EpiControle } from '@conform-plus/shared';

type TimelineEvent = {
  id: string;
  type: 'attribution' | 'retour' | 'controle';
  date: string;
  title: string;
  subtitle?: string;
  variant: 'default' | 'success' | 'warning' | 'danger';
};

interface EpiHistoryTimelineProps {
  attributions?: EpiAttribution[];
  controles?: EpiControle[];
  className?: string;
}

export function EpiHistoryTimeline({
  attributions = [],
  controles = [],
  className,
}: EpiHistoryTimelineProps) {
  // Build timeline events
  const events: TimelineEvent[] = [];

  for (const attr of attributions) {
    events.push({
      id: `attr-${attr.id}`,
      type: 'attribution',
      date: attr.date_attribution,
      title: `Attribue a ${attr.salarie_nom}`,
      subtitle: attr.salarie_poste || undefined,
      variant: 'default',
    });
    if (attr.date_retour) {
      events.push({
        id: `ret-${attr.id}`,
        type: 'retour',
        date: attr.date_retour,
        title: `Retour de ${attr.salarie_nom}`,
        subtitle: attr.motif || undefined,
        variant: 'default',
      });
    }
  }

  for (const ctrl of controles) {
    const resultatLabel = EPI_CONTROLE_RESULTAT_LABELS[ctrl.resultat] || ctrl.resultat;
    events.push({
      id: `ctrl-${ctrl.id}`,
      type: 'controle',
      date: ctrl.date_controle,
      title: `Controle : ${resultatLabel}`,
      subtitle: ctrl.controleur ? `Par ${ctrl.controleur}` : undefined,
      variant:
        ctrl.resultat === 'non_conforme'
          ? 'danger'
          : ctrl.resultat === 'a_surveiller'
            ? 'warning'
            : 'success',
    });
  }

  // Sort by date desc
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (events.length === 0) {
    return (
      <div className={cn('rounded-lg border bg-card p-6 text-center', className)}>
        <p className="text-sm text-muted-foreground">Aucun historique pour cet equipement.</p>
      </div>
    );
  }

  const ICON_MAP = {
    attribution: Users,
    retour: ArrowLeftRight,
    controle: ClipboardCheck,
  };

  const VARIANT_COLORS = {
    default: 'border-blue-300 bg-blue-50 text-blue-600',
    success: 'border-green-300 bg-green-50 text-green-600',
    warning: 'border-orange-300 bg-orange-50 text-orange-600',
    danger: 'border-red-300 bg-red-50 text-red-600',
  };

  return (
    <div className={cn('relative space-y-0', className)}>
      {events.map((event, idx) => {
        const Icon = ICON_MAP[event.type];
        const isLast = idx === events.length - 1;
        return (
          <div key={event.id} className="flex gap-4">
            {/* Line + Icon */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
                  VARIANT_COLORS[event.variant],
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              {!isLast && <div className="w-px flex-1 bg-border" />}
            </div>

            {/* Content */}
            <div className={cn('pb-6', isLast && 'pb-0')}>
              <p className="text-sm font-medium text-foreground">{event.title}</p>
              {event.subtitle && (
                <p className="text-xs text-muted-foreground">{event.subtitle}</p>
              )}
              <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                {new Date(event.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
