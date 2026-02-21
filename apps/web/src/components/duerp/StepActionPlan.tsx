'use client';

import { useState } from 'react';
import {
  PRIORITY_LABELS,
  ACTION_STATUS_LABELS,
  ACTION_CATEGORY_LABELS,
} from '@conform-plus/shared';
import type { ActionPriority, ActionStatus } from '@conform-plus/shared';
import type { ComplianceEvaluationResult } from '@conform-plus/shared';
import {
  Plus,
  Trash2,
  Wand2,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { useDuerpWizard } from '@/hooks/useDuerpWizard';

interface StepActionPlanProps {
  wizard: ReturnType<typeof useDuerpWizard>;
}

const PRIORITY_COLORS: Record<string, string> = {
  faible: 'bg-gray-100 text-gray-700',
  moyenne: 'bg-blue-100 text-blue-700',
  haute: 'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
};

export function StepActionPlan({ wizard }: StepActionPlanProps) {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleGenerateActions = () => {
    wizard.generateActionPlans();
  };

  const handleEvaluateCompliance = async () => {
    setIsEvaluating(true);
    setEvaluationError(null);
    try {
      const payload = {
        companyId: wizard.companyId,
        siteId: wizard.siteId || undefined,
        workUnits: wizard.workUnits.map((wu) => ({
          name: wu.name,
          description: wu.description,
          risks: wu.risks.map((r) => ({
            category: r.category,
            description: r.description,
            severity: r.severity,
            probability: r.probability,
            existing_measures: r.existing_measures,
            is_rps: r.is_rps,
          })),
        })),
        actionPlans: wizard.actionPlans.map((ap) => ({
          name: ap.name,
          description: ap.description,
          priority: ap.priority,
          responsible: ap.responsible,
          deadline: ap.deadline,
          status: ap.status,
          is_critical: ap.is_critical,
          has_proof: ap.has_proof,
        })),
      };

      const result = await api.post<ComplianceEvaluationResult>(
        '/compliance/evaluate',
        payload
      );
      wizard.setComplianceResult(result);
    } catch (err: any) {
      setEvaluationError(err.message || 'Erreur lors de l\'evaluation de conformite');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Etape 3 : Plan d'actions (PAPRIPACT)</h2>
        <p className="text-sm text-muted-foreground">
          Definissez les actions de prevention a mettre en place pour chaque risque identifie.
        </p>
      </div>

      {/* Generate Actions Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleGenerateActions}
          className={cn(
            'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
            'hover:bg-primary/90 transition-colors'
          )}
        >
          <Wand2 className="h-4 w-4" />
          Generer les actions depuis les risques
        </button>
        {wizard.actionPlans.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {wizard.actionPlans.length} action(s) definies
          </span>
        )}
      </div>

      {/* Action Plans Table */}
      {wizard.actionPlans.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            Aucune action definie. Cliquez sur "Generer les actions" pour creer automatiquement
            des actions a partir des risques identifies, ou ajoutez-les manuellement.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground w-8"></th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                    Action
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                    Priorite
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                    Responsable
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                    Echeance
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                    Statut
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                    Critique
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground w-10"></th>
                </tr>
              </thead>
              <tbody>
                {wizard.actionPlans.map((plan) => {
                  const isExpanded = expandedRows.has(plan.id);

                  return (
                    <tr key={plan.id} className="group">
                      <td colSpan={8} className="p-0">
                        <div className="border-b last:border-0">
                          {/* Main Row */}
                          <div className="flex items-center">
                            <div className="px-3 py-2 w-8">
                              <button
                                type="button"
                                onClick={() => toggleRow(plan.id)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            <div className="flex-1 px-3 py-2">
                              <input
                                type="text"
                                value={plan.name}
                                onChange={(e) =>
                                  wizard.updateActionPlan(plan.id, { name: e.target.value })
                                }
                                className={cn(
                                  'h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                )}
                                placeholder="Nom de l'action..."
                              />
                            </div>
                            <div className="px-3 py-2 w-32">
                              <select
                                value={plan.priority}
                                onChange={(e) =>
                                  wizard.updateActionPlan(plan.id, {
                                    priority: e.target.value as ActionPriority,
                                  })
                                }
                                className={cn(
                                  'h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                )}
                              >
                                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="px-3 py-2 w-36">
                              <input
                                type="text"
                                value={plan.responsible}
                                onChange={(e) =>
                                  wizard.updateActionPlan(plan.id, {
                                    responsible: e.target.value,
                                  })
                                }
                                className={cn(
                                  'h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                )}
                                placeholder="Responsable..."
                              />
                            </div>
                            <div className="px-3 py-2 w-36">
                              <input
                                type="date"
                                value={plan.deadline}
                                onChange={(e) =>
                                  wizard.updateActionPlan(plan.id, {
                                    deadline: e.target.value,
                                  })
                                }
                                className={cn(
                                  'h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                )}
                              />
                            </div>
                            <div className="px-3 py-2 w-32">
                              <select
                                value={plan.status}
                                onChange={(e) =>
                                  wizard.updateActionPlan(plan.id, {
                                    status: e.target.value as ActionStatus,
                                  })
                                }
                                className={cn(
                                  'h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                )}
                              >
                                {Object.entries(ACTION_STATUS_LABELS).map(([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="px-3 py-2 w-16 text-center">
                              <input
                                type="checkbox"
                                checked={plan.is_critical}
                                onChange={(e) =>
                                  wizard.updateActionPlan(plan.id, {
                                    is_critical: e.target.checked,
                                  })
                                }
                                className="h-4 w-4 rounded border-gray-300"
                              />
                            </div>
                            <div className="px-3 py-2 w-10">
                              <button
                                type="button"
                                onClick={() => wizard.removeActionPlan(plan.id)}
                                className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                title="Supprimer l'action"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Description + PAPRIPACT fields + Proof */}
                          {isExpanded && (
                            <div className="border-t bg-muted/20 px-4 py-3 space-y-4">
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                  Description
                                </label>
                                <textarea
                                  value={plan.description}
                                  onChange={(e) =>
                                    wizard.updateActionPlan(plan.id, {
                                      description: e.target.value,
                                    })
                                  }
                                  placeholder="Description detaillee de l'action..."
                                  rows={3}
                                  className={cn(
                                    'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                                    'placeholder:text-muted-foreground',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                  )}
                                />
                              </div>

                              {/* PAPRIPACT Fields */}
                              <div className="rounded-md border bg-background p-3 space-y-3">
                                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                  PAPRIPACT
                                </h5>
                                <div className="grid gap-3 sm:grid-cols-2">
                                  {/* Category */}
                                  <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">
                                      Categorie
                                    </label>
                                    <select
                                      value={plan.category || 'prevention'}
                                      onChange={(e) =>
                                        wizard.updateActionPlan(plan.id, {
                                          category: e.target.value,
                                        })
                                      }
                                      className={cn(
                                        'flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                      )}
                                    >
                                      {Object.entries(ACTION_CATEGORY_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>
                                          {label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Budget */}
                                  <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">
                                      Budget estime (EUR)
                                    </label>
                                    <input
                                      type="text"
                                      value={plan.budget_estimate || ''}
                                      onChange={(e) =>
                                        wizard.updateActionPlan(plan.id, {
                                          budget_estimate: e.target.value,
                                        })
                                      }
                                      placeholder="Ex: 500"
                                      className={cn(
                                        'flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm',
                                        'placeholder:text-muted-foreground',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                      )}
                                    />
                                  </div>

                                  {/* Resources */}
                                  <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">
                                      Ressources necessaires
                                    </label>
                                    <input
                                      type="text"
                                      value={plan.resources || ''}
                                      onChange={(e) =>
                                        wizard.updateActionPlan(plan.id, {
                                          resources: e.target.value,
                                        })
                                      }
                                      placeholder="Ex: Formation, EPI, intervenant externe..."
                                      className={cn(
                                        'flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm',
                                        'placeholder:text-muted-foreground',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                      )}
                                    />
                                  </div>

                                  {/* Completion percentage */}
                                  <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">
                                      Avancement : {plan.completion_percentage || 0}%
                                    </label>
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      step={5}
                                      value={plan.completion_percentage || 0}
                                      onChange={(e) =>
                                        wizard.updateActionPlan(plan.id, {
                                          completion_percentage: parseInt(e.target.value, 10),
                                        })
                                      }
                                      className="w-full accent-primary"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Proof Section */}
                              {plan.is_critical && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      id={`proof-${plan.id}`}
                                      checked={plan.has_proof}
                                      onChange={(e) =>
                                        wizard.updateActionPlan(plan.id, {
                                          has_proof: e.target.checked,
                                        })
                                      }
                                      className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label
                                      htmlFor={`proof-${plan.id}`}
                                      className="text-sm text-muted-foreground"
                                    >
                                      Preuve jointe
                                    </label>
                                  </div>
                                  <div className="rounded-md border border-dashed bg-background p-4 text-center">
                                    <Upload className="mx-auto h-6 w-6 text-muted-foreground/50" />
                                    <p className="mt-1 text-xs text-muted-foreground">
                                      L&apos;upload de preuve sera disponible apres la creation du DUERP.
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Action Button */}
      <button
        type="button"
        onClick={() => wizard.addActionPlan()}
        className={cn(
          'inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium',
          'hover:bg-accent hover:text-accent-foreground transition-colors'
        )}
      >
        <Plus className="h-4 w-4" />
        Ajouter une action
      </button>

      {/* Compliance Evaluation */}
      <div className="border-t pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Evaluation de conformite</h3>
            <p className="text-xs text-muted-foreground">
              Verifiez la conformite de votre DUERP par rapport aux regles en vigueur.
            </p>
          </div>
          <button
            type="button"
            onClick={handleEvaluateCompliance}
            disabled={isEvaluating}
            className={cn(
              'inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium',
              'hover:bg-accent hover:text-accent-foreground transition-colors',
              isEvaluating && 'cursor-not-allowed opacity-50'
            )}
          >
            {isEvaluating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            {isEvaluating ? 'Evaluation en cours...' : 'Evaluer la conformite'}
          </button>
        </div>

        {evaluationError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{evaluationError}</p>
          </div>
        )}

        {wizard.complianceResult && (
          <ComplianceResultCard result={wizard.complianceResult} />
        )}
      </div>
    </div>
  );
}

function ComplianceResultCard({ result }: { result: ComplianceEvaluationResult }) {
  const scorePercentage = result.totalRules > 0
    ? Math.round((result.passedRules / result.totalRules) * 100)
    : 0;

  const scoreColor =
    scorePercentage >= 80
      ? 'text-green-600 border-green-500'
      : scorePercentage >= 50
        ? 'text-yellow-600 border-yellow-500'
        : 'text-red-600 border-red-500';

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full border-4',
            scoreColor
          )}
        >
          <span className="text-lg font-bold">{scorePercentage}%</span>
        </div>
        <div>
          <p className="font-semibold">Score de conformite : {result.score}</p>
          <p className="text-sm text-muted-foreground">
            {result.passedRules} / {result.totalRules} regles respectees
          </p>
        </div>
      </div>

      {result.results.length > 0 && (
        <div className="space-y-2">
          {result.results.map((r, i) => (
            <div
              key={i}
              className={cn(
                'flex items-start gap-2 rounded-md p-2 text-sm',
                r.passed
                  ? 'bg-green-50 text-green-800'
                  : r.severity === 'critical'
                    ? 'bg-red-50 text-red-800'
                    : 'bg-yellow-50 text-yellow-800'
              )}
            >
              {r.passed ? (
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <div>
                <span className="font-medium">{r.ruleName}</span>
                <span className="mx-1">-</span>
                <span>{r.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
