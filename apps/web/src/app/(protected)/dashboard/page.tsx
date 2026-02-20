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
} from 'lucide-react';
import { cn } from '@/lib/utils';

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'border-green-500 text-green-600'
      : score >= 50
        ? 'border-yellow-500 text-yellow-600'
        : 'border-red-500 text-red-600';

  return (
    <div
      className={cn(
        'flex h-20 w-20 items-center justify-center rounded-full border-4',
        color,
      )}
    >
      <span className="text-2xl font-bold">{score}</span>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Erreur lors du chargement : {(error as Error).message}
          </p>
        </div>
      </div>
    );
  }

  const overview = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tableau de bord</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground">Sites</h2>
          </div>
          <p className="mt-3 text-3xl font-bold">{overview?.sites_count ?? 0}</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground">DUERP</h2>
          </div>
          <p className="mt-3 text-3xl font-bold">{overview?.duerps_count ?? 0}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {overview?.duerps_validated ?? 0} valide(s)
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground">Actions</h2>
          </div>
          <p className="mt-3 text-3xl font-bold">
            {overview?.action_plans_pending ?? 0}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            en attente
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-orange-500" />
            <h2 className="text-sm font-medium text-muted-foreground">En retard</h2>
          </div>
          <p className={cn(
            'mt-3 text-3xl font-bold',
            (overview?.action_plans_overdue ?? 0) > 0 && 'text-red-600',
          )}>
            {overview?.action_plans_overdue ?? 0}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            action(s) en retard
          </p>
        </div>
      </div>

      {/* Score + Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Score de conformite */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-medium text-muted-foreground">
            Score de conformite
          </h2>
          <div className="mt-4 flex items-center gap-4">
            {overview ? (
              <>
                <ScoreRing score={overview.compliance_score} />
                <div>
                  <p className="text-sm font-medium">
                    {overview.compliance_score >= 80
                      ? 'Bon niveau de conformite'
                      : overview.compliance_score >= 50
                        ? 'Ameliorations necessaires'
                        : 'Conformite insuffisante'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Base sur {overview.unresolved_alerts} alerte(s) non resolue(s)
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-muted">
                  <span className="text-2xl font-bold text-muted-foreground">--</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Creez votre premier DUERP pour obtenir votre score.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Alertes critiques */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              Alertes non resolues
            </h2>
            <Link
              href="/alerts"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4">
            {(overview?.unresolved_alerts ?? 0) === 0 ? (
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-green-500" />
                <p className="text-sm text-muted-foreground">
                  Aucune alerte pour le moment. Tout est en ordre.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {overview?.unresolved_alerts}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    alerte(s) a traiter
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
