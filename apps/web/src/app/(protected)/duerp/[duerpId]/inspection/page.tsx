'use client';

import { useParams } from 'next/navigation';
import { useDuerp, useDuerpVersions } from '@/hooks/useDuerp';
import { useDuerpTriggers } from '@/hooks/useDuerpTriggers';
import {
  Loader2,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  FileCheck,
  History,
  Zap,
  ClipboardList,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckItem {
  label: string;
  description: string;
  passed: boolean;
  icon: React.ReactNode;
}

export default function InspectionPage() {
  const { duerpId } = useParams<{ duerpId: string }>();
  const { data: duerp, isLoading } = useDuerp(duerpId);
  const { data: versions } = useDuerpVersions(duerpId);
  const { data: triggers } = useDuerpTriggers(false); // Unresolved only

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!duerp) {
    return (
      <div className="py-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">DUERP non trouve</h3>
      </div>
    );
  }

  const actionPlans = (duerp as any).action_plans || [];
  const workUnits = (duerp as any).work_units || [];
  const unresolvedTriggers = (triggers as any[] || []);
  const totalRisks = workUnits.reduce((sum: number, wu: any) => sum + (wu.risks?.length || 0), 0);
  const actionsWithProof = actionPlans.filter((p: any) => p.proof_url).length;
  const isOverdue = (duerp as any).next_update_due && new Date((duerp as any).next_update_due) < new Date();
  const hasVersions = versions && (versions as any[]).length > 0;
  const isValidated = duerp.status === 'validated';

  // Build checklist
  const checks: CheckItem[] = [
    {
      label: 'DUERP existe',
      description: 'Le Document Unique est cree et accessible.',
      passed: true,
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: 'DUERP valide',
      description: 'Le document a ete valide par le responsable.',
      passed: isValidated,
      icon: <FileCheck className="h-4 w-4" />,
    },
    {
      label: 'Mise a jour < 12 mois',
      description: 'Le DUERP a ete mis a jour au cours des 12 derniers mois.',
      passed: !isOverdue,
      icon: <History className="h-4 w-4" />,
    },
    {
      label: 'Declencheurs resolus',
      description: 'Tous les evenements declencheurs ont ete pris en compte.',
      passed: unresolvedTriggers.length === 0,
      icon: <Zap className="h-4 w-4" />,
    },
    {
      label: 'Risques identifies',
      description: 'Au moins un risque a ete identifie et evalue.',
      passed: totalRisks > 0,
      icon: <Shield className="h-4 w-4" />,
    },
    {
      label: 'Actions de prevention',
      description: 'Un plan d\'actions de prevention est defini.',
      passed: actionPlans.length > 0,
      icon: <ClipboardList className="h-4 w-4" />,
    },
    {
      label: `Preuves attachees (${actionsWithProof}/${actionPlans.filter((p: any) => p.is_critical).length})`,
      description: 'Les actions critiques disposent d\'une preuve de realisation.',
      passed: actionPlans.filter((p: any) => p.is_critical).length === 0 || actionsWithProof > 0,
      icon: <FileCheck className="h-4 w-4" />,
    },
    {
      label: 'Historique des versions',
      description: 'L\'historique complet des versions est disponible (audit trail).',
      passed: !!hasVersions,
      icon: <History className="h-4 w-4" />,
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const totalChecks = checks.length;
  const score = Math.round((passedCount / totalChecks) * 100);

  const scoreColor = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';
  const scoreBorder = score >= 80 ? 'border-green-500' : score >= 50 ? 'border-yellow-500' : 'border-red-500';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Preparation inspection</h1>
        <p className="text-sm text-muted-foreground">
          Verifiez que votre DUERP est complet et pret en cas de controle de l&apos;inspection du travail.
        </p>
      </div>

      {/* Score */}
      <div className="flex items-center gap-6 rounded-lg border bg-card p-6 shadow-sm">
        <div className={cn('flex h-24 w-24 items-center justify-center rounded-full border-4', scoreBorder)}>
          <span className={cn('text-3xl font-bold', scoreColor)}>{score}%</span>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Score de preparation</h2>
          <p className="text-sm text-muted-foreground">
            {passedCount} / {totalChecks} criteres remplis
          </p>
          {score < 100 && (
            <p className="mt-1 text-xs text-amber-600">
              {totalChecks - passedCount} point(s) a corriger avant un eventuel controle.
            </p>
          )}
          {score === 100 && (
            <p className="mt-1 text-xs text-green-600 font-medium">
              Votre dossier est complet et pret pour une inspection.
            </p>
          )}
        </div>
      </div>

      {/* Checklist */}
      <div className="rounded-lg border bg-card shadow-sm divide-y">
        {checks.map((check, i) => (
          <div
            key={i}
            className={cn(
              'flex items-start gap-4 px-4 py-3',
              !check.passed && 'bg-red-50/50'
            )}
          >
            <div className={cn(
              'mt-0.5 rounded-full p-1',
              check.passed
                ? 'bg-green-100 text-green-600'
                : 'bg-red-100 text-red-600'
            )}>
              {check.passed ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {check.icon}
                <p className="text-sm font-medium">{check.label}</p>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{check.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Warning if unresolved triggers */}
      {unresolvedTriggers.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {unresolvedTriggers.length} declencheur(s) non resolu(s)
            </p>
            <p className="text-xs text-amber-700">
              Ces evenements imposent une mise a jour du DUERP (art. R4121-2).
              Resolez-les avant un controle.
            </p>
          </div>
        </div>
      )}

      {/* Export button placeholder */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled
          className={cn(
            'inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium',
            'cursor-not-allowed opacity-50'
          )}
        >
          <Download className="h-4 w-4" />
          Exporter le dossier complet (bientot)
        </button>
      </div>
    </div>
  );
}
