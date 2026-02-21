'use client';

import { useState } from 'react';
import { useDuerpTriggers, useResolveDuerpTrigger } from '@/hooks/useDuerpTriggers';
import { TriggerCreateForm } from '@/components/duerp/TriggerCreateForm';
import { TRIGGER_TYPE_LABELS } from '@conform-plus/shared';
import {
  Plus,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  Zap,
  RefreshCw,
  Briefcase,
  Scale,
  CalendarClock,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TRIGGER_TYPE_ICONS: Record<string, React.ReactNode> = {
  changement_organisation: <Building2 className="h-4 w-4" />,
  accident_travail: <AlertTriangle className="h-4 w-4" />,
  evolution_poste: <Briefcase className="h-4 w-4" />,
  nouvelle_reglementation: <Scale className="h-4 w-4" />,
  mise_a_jour_annuelle: <CalendarClock className="h-4 w-4" />,
  autre: <HelpCircle className="h-4 w-4" />,
};

export default function TriggersPage() {
  const [tab, setTab] = useState<'unresolved' | 'all'>('unresolved');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const resolveTrigger = useResolveDuerpTrigger();

  const { data: triggers, isLoading, refetch } = useDuerpTriggers(
    tab === 'unresolved' ? false : undefined
  );

  const handleResolve = async (triggerId: string) => {
    try {
      await resolveTrigger.mutateAsync({ triggerId });
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Declencheurs de mise a jour</h1>
          <p className="text-sm text-muted-foreground">
            Evenements imposant la mise a jour du DUERP (art. R4121-2 du Code du travail).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className={cn(
            'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
            'hover:bg-primary/90 transition-colors'
          )}
        >
          <Plus className="h-4 w-4" />
          Nouveau declencheur
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
        <button
          type="button"
          onClick={() => setTab('unresolved')}
          className={cn(
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
            tab === 'unresolved'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            Non resolus
            {triggers && tab === 'unresolved' && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                {(triggers as any[]).length}
              </span>
            )}
          </div>
        </button>
        <button
          type="button"
          onClick={() => setTab('all')}
          className={cn(
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
            tab === 'all'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Tous
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !triggers || (triggers as any[]).length === 0 ? (
        <div className="rounded-lg border border-dashed bg-muted/20 p-12 text-center">
          <Zap className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-4 text-sm font-semibold">
            {tab === 'unresolved' ? 'Aucun declencheur non resolu' : 'Aucun declencheur'}
          </h3>
          <p className="mt-2 text-xs text-muted-foreground">
            {tab === 'unresolved'
              ? 'Tous les declencheurs ont ete pris en compte. Votre DUERP est a jour.'
              : 'Aucun declencheur de mise a jour enregistre.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {(triggers as any[]).map((trigger: any) => (
            <div
              key={trigger.id}
              className={cn(
                'rounded-lg border bg-card p-4 shadow-sm transition-colors',
                !trigger.is_resolved && 'border-l-4 border-l-amber-400'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'mt-0.5 rounded-md p-2',
                      trigger.is_resolved
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    )}
                  >
                    {TRIGGER_TYPE_ICONS[trigger.trigger_type] || <Zap className="h-4 w-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{trigger.title}</h4>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full border px-2 py-0.5 font-medium">
                        {TRIGGER_TYPE_LABELS[trigger.trigger_type as keyof typeof TRIGGER_TYPE_LABELS] || trigger.trigger_type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(trigger.occurred_at).toLocaleDateString('fr-FR')}
                      </span>
                      {trigger.is_resolved && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Resolu le {new Date(trigger.resolved_at).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                    {trigger.description && (
                      <p className="mt-2 text-xs text-muted-foreground">{trigger.description}</p>
                    )}
                  </div>
                </div>

                {!trigger.is_resolved && (
                  <button
                    type="button"
                    onClick={() => handleResolve(trigger.id)}
                    disabled={resolveTrigger.isPending}
                    className={cn(
                      'shrink-0 inline-flex items-center gap-1.5 rounded-md border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700',
                      'hover:bg-green-100 transition-colors',
                      resolveTrigger.isPending && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    {resolveTrigger.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    Marquer resolu
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <TriggerCreateForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
