'use client';

import Link from 'next/link';
import {
  Loader2,
  GraduationCap,
  BadgeCheck,
  AlertTriangle,
  Package,
  BarChart3,
  Table2,
  FileText,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useFormationTypes,
  useFormationStats,
  useInitFormationTypes,
} from '@/hooks/useFormation';
import { FormationStatCards } from '@/components/formations/FormationStatCards';
import { FORMATION_TYPE_PRESETS, FORMATION_CATEGORY_LABELS } from '@conform-plus/shared';

export default function FormationsPage() {
  const { data: types, isLoading } = useFormationTypes();
  const { data: stats } = useFormationStats();
  const initTypes = useInitFormationTypes();

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

  const hasTypes = (types || []).length > 0;
  const totalExpiring = stats
    ? stats.formations_expiring + stats.habilitations_expiring
    : 0;
  const totalExpired = stats
    ? stats.formations_expired + stats.habilitations_expired
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl italic text-foreground">
            Formations & Habilitations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivi de la conformite des formations obligatoires et habilitations reglementaires.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!hasTypes && (
            <button
              onClick={() => initTypes.mutate()}
              disabled={initTypes.isPending}
              className={cn(
                'btn-accent text-xs',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              {initTypes.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Package className="h-3.5 w-3.5" />
              )}
              Initialiser les types
            </button>
          )}
          <Link
            href="/formations/conformite"
            className={cn(
              'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
              'hover:bg-primary/90 transition-colors',
            )}
          >
            <Table2 className="h-4 w-4" />
            Matrice de conformite
          </Link>
        </div>
      </div>

      {/* Stats */}
      {stats && <FormationStatCards stats={stats} />}

      {/* Expiry alert banner */}
      {(totalExpiring > 0 || totalExpired > 0) && (
        <div className="flex items-center gap-3 rounded-lg border border-orange-300 bg-orange-50 p-4">
          <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-800">
              {totalExpiring > 0 && (
                <>{totalExpiring} formation(s)/habilitation(s) expire(nt) dans les 30 prochains jours. </>
              )}
              {totalExpired > 0 && (
                <>{totalExpired} formation(s)/habilitation(s) expiree(s).</>
              )}
            </p>
            <p className="text-xs text-orange-700">
              Planifiez les recyclages et renouvellements necessaires.
            </p>
          </div>
          <Link
            href="/formations/conformite?status=expiring"
            className="ml-auto shrink-0 rounded-md border border-orange-300 bg-white px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-50 transition-colors"
          >
            Voir le detail
          </Link>
        </div>
      )}

      {/* Score gauge */}
      {stats && (
        <div className="card-accent rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-muted-foreground/60" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Score de conformite global
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-full border-4',
                stats.global_score >= 80
                  ? 'border-green-500 text-green-700'
                  : stats.global_score >= 50
                    ? 'border-orange-500 text-orange-700'
                    : 'border-red-500 text-red-700',
              )}
            >
              <span className="text-xl font-bold">{stats.global_score}%</span>
            </div>
            <div>
              <p className="text-sm font-semibold">
                {stats.global_score >= 80
                  ? 'Bon niveau de conformite'
                  : stats.global_score >= 50
                    ? 'A ameliorer'
                    : 'Insuffisant — actions urgentes requises'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Basé sur {stats.total_salaries} salarie(s) et {(types || []).length} type(s) de formation
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Formation types grid */}
      {hasTypes ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Types de formation / habilitation</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(types || []).map((ft) => {
              const preset = FORMATION_TYPE_PRESETS.find((p) => p.code === ft.code);
              return (
                <div
                  key={ft.id}
                  className={cn(
                    'rounded-lg border bg-card p-4 shadow-sm',
                    !ft.is_active && 'opacity-50',
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {ft.category === 'formation' ? (
                        <GraduationCap className="h-4 w-4 text-purple-500" />
                      ) : (
                        <BadgeCheck className="h-4 w-4 text-indigo-500" />
                      )}
                      <div>
                        <p className="text-sm font-semibold">{ft.name}</p>
                        <p className="text-[10px] text-muted-foreground">{ft.code}</p>
                      </div>
                    </div>
                    {ft.is_obligatoire && (
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700">
                        OBLIGATOIRE
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>{FORMATION_CATEGORY_LABELS[ft.category]}</span>
                    {ft.duree_validite_mois ? (
                      <span>Validite : {ft.duree_validite_mois} mois</span>
                    ) : (
                      <span>Pas de peremption</span>
                    )}
                  </div>
                  {ft.norme && (
                    <p className="mt-1 text-[10px] font-mono text-muted-foreground">
                      {ft.norme}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="rounded-lg border bg-card p-12 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Aucun type de formation</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Initialisez les 12 types predefinis (SST, CACES, habilitation electrique...) ou creez vos propres types.
          </p>
          <button
            onClick={() => initTypes.mutate()}
            disabled={initTypes.isPending}
            className="btn-accent mt-4 text-xs"
          >
            {initTypes.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Package className="h-3.5 w-3.5" />
            )}
            Initialiser les 12 types
          </button>
        </div>
      )}

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/formations/conformite"
          className="rounded-lg border bg-card p-5 text-center shadow-sm hover:shadow-md transition-shadow"
        >
          <Table2 className="mx-auto h-6 w-6 text-primary" />
          <p className="mt-2 text-sm font-semibold">Matrice de conformite</p>
          <p className="mt-1 text-xs text-muted-foreground">Vue croisee salaries x formations</p>
        </Link>
        <Link
          href="/registres/formations"
          className="rounded-lg border bg-card p-5 text-center shadow-sm hover:shadow-md transition-shadow"
        >
          <BookOpen className="mx-auto h-6 w-6 text-purple-500" />
          <p className="mt-2 text-sm font-semibold">Registre formations</p>
          <p className="mt-1 text-xs text-muted-foreground">Entrees formations obligatoires</p>
        </Link>
        <Link
          href="/registres/habilitations"
          className="rounded-lg border bg-card p-5 text-center shadow-sm hover:shadow-md transition-shadow"
        >
          <BadgeCheck className="mx-auto h-6 w-6 text-indigo-500" />
          <p className="mt-2 text-sm font-semibold">Registre habilitations</p>
          <p className="mt-1 text-xs text-muted-foreground">CACES, SST, electrique...</p>
        </Link>
      </div>

      {/* Rapport link */}
      <div className="flex items-center justify-between rounded-lg border bg-card/50 p-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-semibold">Rapport d&apos;inspection</p>
            <p className="text-xs text-muted-foreground">
              Document imprimable pour les controles inspection du travail.
            </p>
          </div>
        </div>
        <Link
          href="/formations/rapport"
          className="shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
        >
          Generer le rapport
        </Link>
      </div>

      {/* Legal notice */}
      <div className="rounded-lg border bg-card/50 p-4 text-center">
        <GraduationCap className="mx-auto h-5 w-5 text-muted-foreground/40" />
        <p className="mt-2 text-xs text-muted-foreground">
          Le suivi des formations obligatoires est encadre par les articles L4141-1 a L4141-4 du Code du Travail.
          Les habilitations electriques sont regies par l&apos;Art. R4544-9 CT / NF C18-510.
          Les CACES relevent de l&apos;Art. R4323-56 CT.
        </p>
      </div>
    </div>
  );
}
