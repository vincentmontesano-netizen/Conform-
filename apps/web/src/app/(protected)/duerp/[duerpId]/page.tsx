'use client';

import { use } from 'react';
import Link from 'next/link';
import { useDuerp } from '@/hooks/useDuerp';
import { useCompany } from '@/hooks/useCompany';
import { DUERP_STATUS_LABELS } from '@conform-plus/shared';
import type { DuerpStatus } from '@conform-plus/shared';
import {
  Loader2,
  AlertCircle,
  FileText,
  Pencil,
  History,
  ShieldAlert,
  ClipboardList,
  Building2,
  Zap,
  CalendarClock,
  AlertTriangle,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<DuerpStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-300',
  pending_validation: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  validated: 'bg-green-100 text-green-700 border-green-300',
  archived: 'bg-gray-100 text-gray-500 border-gray-300',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DuerpDetailPage({
  params,
}: {
  params: Promise<{ duerpId: string }>;
}) {
  const { duerpId } = use(params);
  const { data: duerp, isLoading, error } = useDuerp(duerpId);
  const { data: companyDetail } = useCompany(duerp?.company_id ?? '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          Erreur lors du chargement du DUERP : {error.message}
        </p>
      </div>
    );
  }

  if (!duerp) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h2 className="mt-4 text-lg font-semibold">DUERP non trouve</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ce document n'existe pas ou vous n'y avez pas acces.
        </p>
        <Link
          href="/duerp"
          className={cn(
            'mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
            'hover:bg-primary/90 transition-colors'
          )}
        >
          Retour a la liste
        </Link>
      </div>
    );
  }

  const canEdit = duerp.status === 'draft' || duerp.status === 'in_progress';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">DUERP</h1>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                STATUS_COLORS[duerp.status]
              )}
            >
              {DUERP_STATUS_LABELS[duerp.status]}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Version {duerp.current_version} - Cree le {formatDate(duerp.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/duerp/new`}
              className={cn(
                'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
                'hover:bg-primary/90 transition-colors'
              )}
            >
              <Pencil className="h-4 w-4" />
              Modifier
            </Link>
          )}
          <Link
            href={`/duerp/${duerpId}/actions`}
            className={cn(
              'inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium',
              'hover:bg-accent hover:text-accent-foreground transition-colors'
            )}
          >
            <ClipboardList className="h-4 w-4" />
            Actions
          </Link>
          <Link
            href={`/duerp/${duerpId}/papripact`}
            className={cn(
              'inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium',
              'hover:bg-accent hover:text-accent-foreground transition-colors'
            )}
          >
            <FileText className="h-4 w-4" />
            PAPRIPACT
          </Link>
          <Link
            href={`/duerp/${duerpId}/inspection`}
            className={cn(
              'inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium',
              'hover:bg-accent hover:text-accent-foreground transition-colors'
            )}
          >
            <Shield className="h-4 w-4" />
            Inspection
          </Link>
          <Link
            href={`/duerp/${duerpId}/versions`}
            className={cn(
              'inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium',
              'hover:bg-accent hover:text-accent-foreground transition-colors'
            )}
          >
            <History className="h-4 w-4" />
            Versions
          </Link>
        </div>
      </div>

      {/* Company Info */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-4">
          <Building2 className="h-4 w-4" />
          Entreprise
        </h2>
        {companyDetail ? (
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <span className="text-muted-foreground">Nom : </span>
              <span className="font-medium">{companyDetail.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">SIRET : </span>
              <span className="font-mono">{companyDetail.siret}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Effectifs : </span>
              <span>{companyDetail.employee_count} salarie(s)</span>
            </div>
            {duerp.site_id && (
              <div>
                <span className="text-muted-foreground">Site : </span>
                <span>{duerp.site_id}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Chargement des informations...</p>
        )}
      </div>

      {/* Next update date */}
      {(duerp as any).next_update_due && (
        <div className={cn(
          'flex items-center gap-3 rounded-lg border p-4',
          new Date((duerp as any).next_update_due) < new Date()
            ? 'border-red-300 bg-red-50'
            : 'border-green-300 bg-green-50'
        )}>
          <CalendarClock className={cn(
            'h-5 w-5',
            new Date((duerp as any).next_update_due) < new Date()
              ? 'text-red-600'
              : 'text-green-600'
          )} />
          <div>
            <p className={cn(
              'text-sm font-semibold',
              new Date((duerp as any).next_update_due) < new Date()
                ? 'text-red-800'
                : 'text-green-800'
            )}>
              {new Date((duerp as any).next_update_due) < new Date()
                ? 'DUERP en retard de mise a jour !'
                : 'Prochaine mise a jour obligatoire'}
            </p>
            <p className={cn(
              'text-xs',
              new Date((duerp as any).next_update_due) < new Date()
                ? 'text-red-700'
                : 'text-green-700'
            )}>
              Echeance : {formatDate((duerp as any).next_update_due)}
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">v{duerp.current_version}</p>
              <p className="text-xs text-muted-foreground">Version courante</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-100 p-2">
              <ShieldAlert className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {(duerp as any).work_units
                  ? (duerp as any).work_units.reduce((sum: number, wu: any) => sum + (wu.risks?.length || 0), 0)
                  : 0}
              </p>
              <p className="text-xs text-muted-foreground">Risques identifies</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <ClipboardList className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {(duerp as any).action_plans?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Actions de prevention</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {(duerp as any).work_units?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Unites de travail</p>
            </div>
          </div>
        </div>
      </div>

      {/* Work Units summary */}
      {(duerp as any).work_units && (duerp as any).work_units.length > 0 && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-4">
            <ShieldAlert className="h-4 w-4" />
            Unites de travail et risques
          </h2>
          <div className="space-y-3">
            {(duerp as any).work_units.map((wu: any, idx: number) => (
              <div key={wu.id} className="rounded-md border p-3">
                <p className="text-sm font-medium">
                  <span className="text-muted-foreground">UT{idx + 1} :</span> {wu.name}
                </p>
                {wu.risks && wu.risks.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {wu.risks.length} risque(s) identifie(s)
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back link */}
      <div>
        <Link
          href="/duerp"
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          Retour a la liste des DUERP
        </Link>
      </div>
    </div>
  );
}
