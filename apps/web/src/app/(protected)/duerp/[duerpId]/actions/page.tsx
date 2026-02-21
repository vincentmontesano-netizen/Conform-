'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useDuerp, useUpdateActionPlan } from '@/hooks/useDuerp';
import { ActionPlanDetailPanel } from '@/components/duerp/ActionPlanDetailPanel';
import {
  ACTION_STATUS_LABELS,
  PRIORITY_LABELS,
} from '@conform-plus/shared';
import {
  Loader2,
  ClipboardList,
  GripVertical,
  AlertTriangle,
  Clock,
  User,
  FileCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const KANBAN_COLUMNS = [
  { status: 'a_faire', label: 'A faire', color: 'border-t-slate-400' },
  { status: 'en_cours', label: 'En cours', color: 'border-t-blue-400' },
  { status: 'terminee', label: 'Terminee', color: 'border-t-green-400' },
  { status: 'annulee', label: 'Annulee', color: 'border-t-gray-300' },
];

const PRIORITY_BADGE_COLORS: Record<string, string> = {
  faible: 'bg-gray-100 text-gray-700',
  moyenne: 'bg-blue-100 text-blue-700',
  haute: 'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
};

export default function ActionsPage() {
  const { duerpId } = useParams<{ duerpId: string }>();
  const { data: duerp, isLoading } = useDuerp(duerpId);
  const updatePlan = useUpdateActionPlan();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

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
        <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">DUERP non trouve</h3>
      </div>
    );
  }

  const actionPlans = (duerp as any).action_plans || [];
  const selectedPlan = actionPlans.find((p: any) => p.id === selectedPlanId);

  const handleDrop = async (planId: string, newStatus: string) => {
    try {
      await updatePlan.mutateAsync({
        duerpId,
        planId,
        data: { status: newStatus },
      });
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plan d&apos;actions</h1>
        <p className="text-sm text-muted-foreground">
          Suivi des actions de prevention du DUERP. Cliquez sur une action pour voir le detail.
        </p>
      </div>

      {actionPlans.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-muted/20 p-12 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-4 text-sm font-semibold">Aucune action definie</h3>
          <p className="mt-2 text-xs text-muted-foreground">
            Les actions sont definies lors de la creation du DUERP.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-4">
          {KANBAN_COLUMNS.map((column) => {
            const columnPlans = actionPlans.filter(
              (p: any) => p.status === column.status
            );

            return (
              <div
                key={column.status}
                className={cn(
                  'rounded-lg border border-t-4 bg-muted/10',
                  column.color
                )}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const planId = e.dataTransfer.getData('planId');
                  if (planId) handleDrop(planId, column.status);
                }}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {column.label}
                  </h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
                    {columnPlans.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2 min-h-[200px]">
                  {columnPlans.map((plan: any) => {
                    const isOverdue =
                      plan.deadline &&
                      new Date(plan.deadline) < new Date() &&
                      plan.status !== 'terminee' &&
                      plan.status !== 'annulee';

                    return (
                      <div
                        key={plan.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('planId', plan.id);
                        }}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={cn(
                          'cursor-pointer rounded-md border bg-card p-3 shadow-sm transition-shadow hover:shadow-md',
                          isOverdue && 'border-red-200'
                        )}
                      >
                        {/* Card content */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium leading-tight">
                            {plan.name}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={cn(
                                'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                PRIORITY_BADGE_COLORS[plan.priority] || 'bg-gray-100 text-gray-700'
                              )}
                            >
                              {PRIORITY_LABELS[plan.priority as keyof typeof PRIORITY_LABELS] || plan.priority}
                            </span>
                            {plan.is_critical && (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                                Critique
                              </span>
                            )}
                          </div>

                          {/* Meta info */}
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                            {plan.responsible && (
                              <span className="flex items-center gap-0.5">
                                <User className="h-3 w-3" />
                                {plan.responsible}
                              </span>
                            )}
                            {plan.deadline && (
                              <span className={cn(
                                'flex items-center gap-0.5',
                                isOverdue && 'text-red-600 font-semibold'
                              )}>
                                <Clock className="h-3 w-3" />
                                {new Date(plan.deadline).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                            {plan.proof_url && (
                              <span className="flex items-center gap-0.5 text-green-600">
                                <FileCheck className="h-3 w-3" />
                                Preuve
                              </span>
                            )}
                          </div>

                          {/* Progress bar */}
                          {plan.completion_percentage > 0 && (
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${plan.completion_percentage}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Panel */}
      {selectedPlan && (
        <ActionPlanDetailPanel
          duerpId={duerpId}
          plan={selectedPlan}
          onClose={() => setSelectedPlanId(null)}
        />
      )}
    </div>
  );
}
