'use client';

import Link from 'next/link';
import { useDashboard } from '@/hooks/useDashboard';
import {
  Loader2,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  Building2,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  CalendarClock,
  Zap,
  BookOpen,
  Timer,
  HardHat,
  GraduationCap,
  BadgeCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function ScoreGauge({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? 'hsl(var(--success))' : score >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';
  const label =
    score >= 80
      ? 'Bon niveau'
      : score >= 50
        ? 'A ameliorer'
        : 'Insuffisant';

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-24 w-24 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              animation: 'score-fill 1.2s ease-out forwards',
              strokeDashoffset: offset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{score}</span>
          <span className="text-[10px] font-medium text-muted-foreground">/100</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Score de conformite</p>
      </div>
    </div>
  );
}

const kpiConfig = [
  {
    key: 'sites',
    label: 'Sites',
    icon: Building2,
    getValue: (d: { sites_count: number }) => d.sites_count,
    accent: false,
  },
  {
    key: 'duerps',
    label: 'DUERP',
    icon: FileText,
    getValue: (d: { duerps_count: number }) => d.duerps_count,
    sub: (d: { duerps_validated: number }) => `${d.duerps_validated} valide(s)`,
    accent: false,
  },
  {
    key: 'actions',
    label: 'Actions en attente',
    icon: ClipboardList,
    getValue: (d: { action_plans_pending: number }) => d.action_plans_pending,
    accent: false,
  },
  {
    key: 'overdue',
    label: 'Actions en retard',
    icon: Clock,
    getValue: (d: { action_plans_overdue: number }) => d.action_plans_overdue,
    accent: true,
  },
  {
    key: 'duerps_overdue',
    label: 'DUERP en retard',
    icon: CalendarClock,
    getValue: (d: { duerps_overdue: number }) => d.duerps_overdue ?? 0,
    accent: true,
  },
  {
    key: 'triggers',
    label: 'Declencheurs',
    icon: Zap,
    getValue: (d: { unresolved_triggers: number }) => d.unresolved_triggers ?? 0,
    sub: () => 'non resolu(s)',
    accent: true,
  },
  {
    key: 'registres',
    label: 'Registres actifs',
    icon: BookOpen,
    getValue: (d: { registres_count: number }) => d.registres_count ?? 0,
    accent: false,
  },
  {
    key: 'registre_expiring',
    label: 'Echeances proches',
    icon: Timer,
    getValue: (d: { registre_entries_expiring: number }) => d.registre_entries_expiring ?? 0,
    sub: () => 'dans les 30 jours',
    accent: true,
  },
  {
    key: 'epi',
    label: 'EPI en service',
    icon: HardHat,
    getValue: (d: { epi_count: number }) => d.epi_count ?? 0,
    accent: false,
  },
  {
    key: 'epi_expiring',
    label: 'EPI a renouveler',
    icon: HardHat,
    getValue: (d: { epi_expiring: number }) => d.epi_expiring ?? 0,
    sub: () => 'dans les 30 jours',
    accent: true,
  },
  {
    key: 'formations_expiring',
    label: 'Formations expirant',
    icon: GraduationCap,
    getValue: (d: { formations_expiring: number }) => d.formations_expiring ?? 0,
    sub: () => 'dans les 30 jours',
    accent: true,
  },
  {
    key: 'habilitations_expiring',
    label: 'Habilitations expirant',
    icon: BadgeCheck,
    getValue: (d: { habilitations_expiring: number }) => d.habilitations_expiring ?? 0,
    sub: () => 'dans les 30 jours',
    accent: true,
  },
] as const;

export default function DashboardPage() {
  const { data: overview, isLoading, error } = useDashboard();

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

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl italic text-foreground">Tableau de bord</h1>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
          <p className="text-sm text-destructive">
            Erreur lors du chargement : {(error as Error).message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl italic text-foreground">Tableau de bord</h1>
          <p className="mt-1 text-sm text-muted-foreground">Vue d&apos;ensemble de votre conformite</p>
        </div>
        <Link
          href="/duerp/new"
          className="btn-accent text-xs"
        >
          <FileText className="h-3.5 w-3.5" />
          Nouveau DUERP
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="stagger-in grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiConfig.map((kpi) => {
          const value = overview ? kpi.getValue(overview as never) : 0;
          const isWarning = kpi.accent && value > 0;
          return (
            <div
              key={kpi.key}
              className={cn(
                'card-accent rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md',
                isWarning && 'border-destructive/20',
              )}
            >
              <div className="flex items-center gap-2.5">
                <kpi.icon
                  className={cn(
                    'h-4 w-4',
                    isWarning ? 'text-destructive' : 'text-muted-foreground/60',
                  )}
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {kpi.label}
                </span>
              </div>
              <p
                className={cn(
                  'mt-3 text-3xl font-bold tracking-tight',
                  isWarning && 'text-destructive',
                )}
              >
                {value}
              </p>
              {'sub' in kpi && kpi.sub && overview && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {kpi.sub(overview as never)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Score + Alerts row */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Compliance Score */}
        <div className="card-accent rounded-lg border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-4 w-4 text-muted-foreground/60" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Conformite
            </h2>
          </div>

          {overview ? (
            <>
              <ScoreGauge score={overview.compliance_score} />
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Base sur {overview.unresolved_alerts} alerte(s) non resolue(s)
              </p>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-dashed border-border">
                <span className="text-lg font-bold text-muted-foreground">--</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Creez votre premier DUERP pour obtenir votre score.
              </p>
            </div>
          )}
        </div>

        {/* Alerts Panel */}
        <div className="card-accent rounded-lg border bg-card p-6 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground/60" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Alertes non resolues
              </h2>
            </div>
            <Link
              href="/alerts"
              className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
            >
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {(overview?.unresolved_alerts ?? 0) === 0 ? (
            <div className="flex items-center gap-4 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--success)/0.1)]">
                <ShieldCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Tout est en ordre</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Aucune alerte de conformite pour le moment.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--warning)/0.12)]">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {overview?.unresolved_alerts}
                </p>
                <p className="text-xs text-muted-foreground">
                  alerte(s) a traiter en priorite
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
