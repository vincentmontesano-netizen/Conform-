'use client';

import { Loader2, AlertTriangle, BookOpen, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRegistres, useCreateRegistre, useRegistreExpiringEntries } from '@/hooks/useRegistre';
import { RegistreCard } from '@/components/registres/RegistreCard';
import {
  REGISTRE_TEMPLATES,
  RegistreType,
} from '@conform-plus/shared';

const ALL_TYPES = Object.values(RegistreType);

export default function RegistresPage() {
  const { data: registres, isLoading } = useRegistres();
  const { data: expiring } = useRegistreExpiringEntries(30);
  const createRegistre = useCreateRegistre();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <span className="text-xs text-muted-foreground">Chargement...</span>
        </div>
      </div>
    );
  }

  // Map existing registres by type
  const registreByType = new Map(
    (registres || []).map((r) => [r.type, r])
  );

  // Count expiring per type
  const expiringByType = new Map<string, number>();
  for (const entry of expiring || []) {
    const type = (entry as any).registres?.type;
    if (type) {
      expiringByType.set(type, (expiringByType.get(type) || 0) + 1);
    }
  }

  const totalExpiring = expiring?.length || 0;
  const hasAnyRegistre = (registres || []).length > 0;

  const handleInitAll = async () => {
    for (const type of ALL_TYPES) {
      if (!registreByType.has(type)) {
        const template = REGISTRE_TEMPLATES[type];
        await createRegistre.mutateAsync({
          type,
          name: template.label,
          description: template.description,
        });
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl italic text-foreground">Registres obligatoires</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerez vos 8 registres reglementaires en conformite avec le Code du Travail et le RGPD.
          </p>
        </div>
        {!hasAnyRegistre && (
          <button
            onClick={handleInitAll}
            disabled={createRegistre.isPending}
            className={cn(
              'btn-accent text-xs',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {createRegistre.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            Initialiser tous les registres
          </button>
        )}
      </div>

      {/* Expiry alert banner */}
      {totalExpiring > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-orange-300 bg-orange-50 p-4">
          <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-800">
              {totalExpiring} echeance(s) dans les 30 prochains jours
            </p>
            <p className="text-xs text-orange-700">
              Verifiez et renouvelez les habilitations, formations et controles arrivant a echeance.
            </p>
          </div>
        </div>
      )}

      {/* Grid of 8 register cards */}
      <div className="stagger-in grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ALL_TYPES.map((type) => {
          const template = REGISTRE_TEMPLATES[type];
          const existing = registreByType.get(type);
          return (
            <RegistreCard
              key={type}
              template={template}
              entriesCount={existing?.entries_count || 0}
              expiringCount={expiringByType.get(type) || 0}
              exists={!!existing}
            />
          );
        })}
      </div>

      {/* Legal notice */}
      <div className="rounded-lg border bg-card/50 p-4 text-center">
        <BookOpen className="mx-auto h-5 w-5 text-muted-foreground/40" />
        <p className="mt-2 text-xs text-muted-foreground">
          La tenue de ces registres est obligatoire pour toute entreprise employant des salaries.
          Leur absence peut entrainer des amendes lors d&apos;un controle de l&apos;inspection du travail.
        </p>
      </div>
    </div>
  );
}
