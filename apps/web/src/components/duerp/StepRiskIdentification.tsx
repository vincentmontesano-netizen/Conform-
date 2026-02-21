'use client';

import { useCompany } from '@/hooks/useCompany';
import {
  RISK_CATEGORIES_BY_SECTOR,
  SEVERITY_LABELS,
  PROBABILITY_LABELS,
} from '@conform-plus/shared';
import type { SeverityLevel, ProbabilityLevel } from '@conform-plus/shared';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ShieldAlert,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { WizardTooltip } from '@/components/duerp/WizardTooltip';
import type { useDuerpWizard } from '@/hooks/useDuerpWizard';

interface StepRiskIdentificationProps {
  wizard: ReturnType<typeof useDuerpWizard>;
}

const SEVERITY_VALUES: Record<string, number> = {
  faible: 1,
  modere: 2,
  eleve: 3,
  critique: 4,
};

const PROBABILITY_VALUES: Record<string, number> = {
  improbable: 1,
  peu_probable: 2,
  probable: 3,
  tres_probable: 4,
};

function getRiskScore(severity: string, probability: string): number {
  return (SEVERITY_VALUES[severity] ?? 1) * (PROBABILITY_VALUES[probability] ?? 1);
}

function getRiskColor(score: number): string {
  if (score <= 2) return 'bg-green-100 text-green-800 border-green-300';
  if (score <= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  if (score <= 9) return 'bg-orange-100 text-orange-800 border-orange-300';
  return 'bg-red-100 text-red-800 border-red-300';
}

function getRiskLabel(score: number): string {
  if (score <= 2) return 'Faible';
  if (score <= 6) return 'Modere';
  if (score <= 9) return 'Eleve';
  return 'Critique';
}

export function StepRiskIdentification({ wizard }: StepRiskIdentificationProps) {
  const { data: companyDetail } = useCompany(wizard.companyId);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  const sector = companyDetail?.sector ?? 'autre';
  const riskCategories = RISK_CATEGORIES_BY_SECTOR[sector] ?? RISK_CATEGORIES_BY_SECTOR.autre;

  const toggleUnit = (id: string) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddWorkUnit = () => {
    wizard.addWorkUnit();
    // Auto-expand the newly created unit
    // We need to wait for state update, so we use a small trick
    setTimeout(() => {
      const units = wizard.workUnits;
      if (units.length > 0) {
        setExpandedUnits((prev) => new Set([...prev, units[units.length - 1].id]));
      }
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Etape 2 : Identification des risques</h2>
        <p className="text-sm text-muted-foreground">
          Definissez les unites de travail et identifiez les risques associes.
          {companyDetail && (
            <span className="font-medium">
              {' '}Secteur : {sector} - les categories de risques sont adaptees.
            </span>
          )}
        </p>
      </div>

      {/* Risk Score Summary */}
      {wizard.workUnits.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {(() => {
            const allRisks = wizard.workUnits.flatMap((wu) => wu.risks);
            const total = allRisks.length;
            const critical = allRisks.filter((r) => getRiskScore(r.severity, r.probability) >= 9).length;
            const high = allRisks.filter((r) => { const s = getRiskScore(r.severity, r.probability); return s >= 7 && s < 9; }).length;
            const medium = allRisks.filter((r) => { const s = getRiskScore(r.severity, r.probability); return s >= 3 && s < 7; }).length;
            const low = allRisks.filter((r) => getRiskScore(r.severity, r.probability) < 3).length;
            return (
              <>
                <div className="rounded-md border bg-muted/30 px-3 py-1.5 text-xs">
                  <span className="font-semibold">{total}</span> risque(s) total
                </div>
                {critical > 0 && (
                  <div className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs text-red-800">
                    <span className="font-semibold">{critical}</span> critique(s)
                  </div>
                )}
                {high > 0 && (
                  <div className="rounded-md border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs text-orange-800">
                    <span className="font-semibold">{high}</span> eleve(s)
                  </div>
                )}
                {medium > 0 && (
                  <div className="rounded-md border border-yellow-300 bg-yellow-50 px-3 py-1.5 text-xs text-yellow-800">
                    <span className="font-semibold">{medium}</span> modere(s)
                  </div>
                )}
                {low > 0 && (
                  <div className="rounded-md border border-green-300 bg-green-50 px-3 py-1.5 text-xs text-green-800">
                    <span className="font-semibold">{low}</span> faible(s)
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Sector Guidance */}
      {companyDetail && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-3">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <div className="text-xs text-blue-800">
            <span className="font-semibold">Guidance sectorielle ({sector}) :</span>{' '}
            {sector === 'batiment' && 'Pensez aux chutes de hauteur, a l\'amiante, et aux risques lies aux engins de chantier.'}
            {sector === 'restauration' && 'Verifiez les risques de brulures, coupures, sols glissants et stress lie au rythme de travail.'}
            {sector === 'bureau' && 'Focalisez-vous sur les TMS lies au travail sur ecran, le stress et la qualite de l\'air.'}
            {sector === 'commerce' && 'Attention aux manutentions manuelles, agressions et risques routiers pour les livraisons.'}
            {sector === 'industrie' && 'Verifiez les risques machines, chimiques, le bruit et les incendies/explosions.'}
            {sector === 'sante' && 'Pensez aux risques biologiques, manutention de patients et violences.'}
            {sector === 'transport' && 'Le risque routier est prioritaire. Verifiez aussi les TMS et la manutention.'}
            {sector === 'agriculture' && 'Risques phytosanitaires, machines agricoles et conditions climatiques a evaluer.'}
            {(sector === 'services' || sector === 'autre') && 'Evaluez les risques psycho-sociaux, les TMS et les risques electriques.'}
          </div>
        </div>
      )}

      {wizard.workUnits.length === 0 && (
        <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            Aucune unite de travail definie. Ajoutez une unite de travail pour commencer
            l'identification des risques.
          </p>
        </div>
      )}

      {/* Work Units */}
      <div className="space-y-4">
        {wizard.workUnits.map((workUnit, unitIndex) => {
          const isExpanded = expandedUnits.has(workUnit.id);
          const totalRisks = workUnit.risks.length;
          const criticalRisks = workUnit.risks.filter(
            (r) => getRiskScore(r.severity, r.probability) >= 9
          ).length;

          return (
            <div
              key={workUnit.id}
              className="rounded-lg border bg-card shadow-sm"
            >
              {/* Work Unit Header */}
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer"
                onClick={() => toggleUnit(workUnit.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                  <span className="text-sm font-semibold text-muted-foreground">
                    UT{unitIndex + 1}
                  </span>
                  <span className="font-medium truncate">
                    {workUnit.name || 'Unite de travail sans nom'}
                  </span>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs text-muted-foreground">
                      {totalRisks} risque(s)
                    </span>
                    {criticalRisks > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                        <AlertTriangle className="h-3 w-3" />
                        {criticalRisks} critique(s)
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    wizard.removeWorkUnit(workUnit.id);
                  }}
                  className="ml-2 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Supprimer l'unite de travail"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Work Unit Content (Expanded) */}
              {isExpanded && (
                <div className="border-t px-4 py-4 space-y-4">
                  {/* Work Unit Fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">
                        Nom de l'unite de travail <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={workUnit.name}
                        onChange={(e) =>
                          wizard.updateWorkUnit(workUnit.id, { name: e.target.value })
                        }
                        placeholder="Ex: Bureau administratif, Atelier production..."
                        className={cn(
                          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                          'placeholder:text-muted-foreground',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                        )}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        value={workUnit.description}
                        onChange={(e) =>
                          wizard.updateWorkUnit(workUnit.id, { description: e.target.value })
                        }
                        placeholder="Description de l'unite de travail..."
                        rows={2}
                        className={cn(
                          'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                          'placeholder:text-muted-foreground',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                        )}
                      />
                    </div>
                  </div>

                  {/* Risks Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold">Risques identifies</h4>
                        <WizardTooltip
                          title="Identification"
                          content="Ajoutez les risques un par un ou utilisez les boutons rapides ci-dessous pour ajouter les risques courants de votre secteur."
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => wizard.addRisk(workUnit.id)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium',
                          'hover:bg-accent hover:text-accent-foreground transition-colors'
                        )}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Ajouter un risque
                      </button>
                    </div>

                    {/* Quick-add buttons by risk category */}
                    {workUnit.risks.length === 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Ajout rapide — cliquez pour ajouter un risque courant :
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {riskCategories.slice(0, 6).map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                wizard.addRisk(workUnit.id);
                                // We need to update the last-added risk with the category
                                setTimeout(() => {
                                  const currentUnit = wizard.workUnits.find((wu) => wu.id === workUnit.id);
                                  if (currentUnit && currentUnit.risks.length > 0) {
                                    const lastRisk = currentUnit.risks[currentUnit.risks.length - 1];
                                    wizard.updateRisk(workUnit.id, lastRisk.id, { category: cat });
                                  }
                                }, 0);
                              }}
                              className={cn(
                                'rounded-full border border-dashed px-2.5 py-1 text-[11px]',
                                'text-muted-foreground hover:border-primary hover:text-primary transition-colors'
                              )}
                            >
                              + {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {workUnit.risks.length === 0 && (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        Aucun risque identifie. Cliquez sur "Ajouter un risque" pour commencer.
                      </p>
                    )}

                    {workUnit.risks.map((risk, riskIndex) => {
                      const score = getRiskScore(risk.severity, risk.probability);
                      const colorClass = getRiskColor(score);
                      const label = getRiskLabel(score);

                      return (
                        <div
                          key={risk.id}
                          className="rounded-md border bg-muted/20 p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-muted-foreground">
                                R{riskIndex + 1}
                              </span>
                              <span
                                className={cn(
                                  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                                  colorClass
                                )}
                              >
                                Score : {score} - {label}
                              </span>
                              {risk.is_rps && (
                                <span className="inline-flex items-center rounded-full border border-purple-300 bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                                  RPS
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => wizard.removeRisk(workUnit.id, risk.id)}
                              className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                              title="Supprimer le risque"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            {/* Category */}
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground">
                                Categorie <span className="text-destructive">*</span>
                              </label>
                              <select
                                value={risk.category}
                                onChange={(e) =>
                                  wizard.updateRisk(workUnit.id, risk.id, {
                                    category: e.target.value,
                                  })
                                }
                                className={cn(
                                  'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                )}
                              >
                                <option value="">Selectionnez une categorie</option>
                                {riskCategories.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground">
                                Description <span className="text-destructive">*</span>
                              </label>
                              <textarea
                                value={risk.description}
                                onChange={(e) =>
                                  wizard.updateRisk(workUnit.id, risk.id, {
                                    description: e.target.value,
                                  })
                                }
                                placeholder="Decrivez le risque..."
                                rows={2}
                                className={cn(
                                  'flex w-full rounded-md border border-input bg-background px-3 py-1 text-sm',
                                  'placeholder:text-muted-foreground',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                )}
                              />
                            </div>

                            {/* Severity */}
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground">
                                Gravite <span className="text-destructive">*</span>
                              </label>
                              <select
                                value={risk.severity}
                                onChange={(e) =>
                                  wizard.updateRisk(workUnit.id, risk.id, {
                                    severity: e.target.value as SeverityLevel,
                                  })
                                }
                                className={cn(
                                  'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                )}
                              >
                                {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Probability */}
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground">
                                Probabilite <span className="text-destructive">*</span>
                              </label>
                              <select
                                value={risk.probability}
                                onChange={(e) =>
                                  wizard.updateRisk(workUnit.id, risk.id, {
                                    probability: e.target.value as ProbabilityLevel,
                                  })
                                }
                                className={cn(
                                  'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                )}
                              >
                                {Object.entries(PROBABILITY_LABELS).map(([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Existing Measures */}
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-xs font-medium text-muted-foreground">
                                Mesures existantes
                              </label>
                              <textarea
                                value={risk.existing_measures}
                                onChange={(e) =>
                                  wizard.updateRisk(workUnit.id, risk.id, {
                                    existing_measures: e.target.value,
                                  })
                                }
                                placeholder="Decrivez les mesures de prevention deja en place..."
                                rows={2}
                                className={cn(
                                  'flex w-full rounded-md border border-input bg-background px-3 py-1 text-sm',
                                  'placeholder:text-muted-foreground',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                )}
                              />
                            </div>
                          </div>

                          {/* RPS Checkbox */}
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`rps-${risk.id}`}
                              checked={risk.is_rps}
                              onChange={(e) =>
                                wizard.updateRisk(workUnit.id, risk.id, {
                                  is_rps: e.target.checked,
                                })
                              }
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <label
                              htmlFor={`rps-${risk.id}`}
                              className="text-sm text-muted-foreground"
                            >
                              Risque psycho-social (RPS)
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Work Unit Button */}
      <button
        type="button"
        onClick={handleAddWorkUnit}
        className={cn(
          'inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/30 px-4 py-3 text-sm font-medium',
          'text-muted-foreground hover:border-primary hover:text-primary transition-colors'
        )}
      >
        <Plus className="h-4 w-4" />
        Ajouter une unite de travail
      </button>
    </div>
  );
}
