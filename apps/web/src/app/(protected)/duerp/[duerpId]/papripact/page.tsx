'use client';

import { useParams } from 'next/navigation';
import { useDuerp } from '@/hooks/useDuerp';
import { ACTION_CATEGORY_LABELS, PRIORITY_LABELS, ACTION_STATUS_LABELS } from '@conform-plus/shared';
import {
  Loader2,
  FileText,
  ShieldCheck,
  GraduationCap,
  Info,
  Building2,
  Settings,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  prevention: <ShieldCheck className="h-4 w-4" />,
  protection: <ShieldCheck className="h-4 w-4" />,
  formation: <GraduationCap className="h-4 w-4" />,
  information: <Info className="h-4 w-4" />,
  organisation: <Settings className="h-4 w-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  prevention: 'border-l-blue-400 bg-blue-50/30',
  protection: 'border-l-green-400 bg-green-50/30',
  formation: 'border-l-purple-400 bg-purple-50/30',
  information: 'border-l-amber-400 bg-amber-50/30',
  organisation: 'border-l-slate-400 bg-slate-50/30',
};

export default function PapripactPage() {
  const { duerpId } = useParams<{ duerpId: string }>();
  const { data: duerp, isLoading } = useDuerp(duerpId);

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

  // Group by category
  const categories = Object.keys(ACTION_CATEGORY_LABELS);
  const grouped: Record<string, any[]> = {};
  for (const cat of categories) {
    grouped[cat] = actionPlans.filter((p: any) => (p.category || 'prevention') === cat);
  }

  // Budget totals
  const totalBudget = actionPlans.reduce((sum: number, p: any) => sum + (parseFloat(p.budget_estimate) || 0), 0);
  const completedActions = actionPlans.filter((p: any) => p.status === 'terminee').length;
  const totalActions = actionPlans.length;
  const globalProgress = totalActions > 0
    ? Math.round(actionPlans.reduce((sum: number, p: any) => sum + (p.completion_percentage || 0), 0) / totalActions)
    : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">PAPRIPACT</h1>
        <p className="text-sm text-muted-foreground">
          Programme Annuel de Prevention des Risques Professionnels et d&apos;Amelioration des Conditions de Travail.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-2xl font-bold">{totalActions}</p>
          <p className="text-xs text-muted-foreground">Actions totales</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{completedActions}</p>
          <p className="text-xs text-muted-foreground">Actions terminees</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <p className="text-2xl font-bold">{totalBudget.toLocaleString('fr-FR')}</p>
          </div>
          <p className="text-xs text-muted-foreground">Budget total (EUR)</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-2xl font-bold">{globalProgress}%</p>
          <p className="text-xs text-muted-foreground">Avancement global</p>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${globalProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actions by category */}
      {categories.map((cat) => {
        const plans = grouped[cat];
        if (!plans || plans.length === 0) return null;

        const catBudget = plans.reduce((sum: number, p: any) => sum + (parseFloat(p.budget_estimate) || 0), 0);
        const catProgress = plans.length > 0
          ? Math.round(plans.reduce((sum: number, p: any) => sum + (p.completion_percentage || 0), 0) / plans.length)
          : 0;

        return (
          <div key={cat} className={cn('rounded-lg border border-l-4 p-4 space-y-4', CATEGORY_COLORS[cat])}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {CATEGORY_ICONS[cat]}
                <h3 className="text-sm font-semibold">
                  {ACTION_CATEGORY_LABELS[cat as keyof typeof ACTION_CATEGORY_LABELS] || cat}
                </h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
                  {plans.length}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {catBudget > 0 && (
                  <span>{catBudget.toLocaleString('fr-FR')} EUR</span>
                )}
                <span>{catProgress}% avance</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${catProgress}%` }}
              />
            </div>

            {/* Actions table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">Action</th>
                    <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">Priorite</th>
                    <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">Responsable</th>
                    <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">Echeance</th>
                    <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">Budget</th>
                    <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">Statut</th>
                    <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">%</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan: any) => (
                    <tr key={plan.id} className="border-b last:border-0">
                      <td className="px-2 py-1.5 font-medium">{plan.name}</td>
                      <td className="px-2 py-1.5">
                        {PRIORITY_LABELS[plan.priority as keyof typeof PRIORITY_LABELS] || plan.priority}
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">{plan.responsible || '-'}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">
                        {plan.deadline
                          ? new Date(plan.deadline).toLocaleDateString('fr-FR')
                          : '-'}
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">
                        {plan.budget_estimate ? `${plan.budget_estimate} EUR` : '-'}
                      </td>
                      <td className="px-2 py-1.5">
                        {ACTION_STATUS_LABELS[plan.status as keyof typeof ACTION_STATUS_LABELS] || plan.status}
                      </td>
                      <td className="px-2 py-1.5">{plan.completion_percentage || 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Empty state */}
      {totalActions === 0 && (
        <div className="rounded-lg border border-dashed bg-muted/20 p-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-4 text-sm font-semibold">Aucune action definie</h3>
          <p className="mt-2 text-xs text-muted-foreground">
            Le PAPRIPACT sera genere automatiquement a partir des actions du DUERP.
          </p>
        </div>
      )}
    </div>
  );
}
