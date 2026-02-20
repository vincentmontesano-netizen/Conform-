'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCompany, useSites } from '@/hooks/useCompany';
import { useCreateDuerp, useAddWorkUnit, useAddRisk, useAddActionPlan, useValidateDuerp } from '@/hooks/useDuerp';
import {
  SECTORS,
  SEVERITY_LABELS,
  PROBABILITY_LABELS,
  PRIORITY_LABELS,
  ACTION_STATUS_LABELS,
} from '@conform-plus/shared';
import type { ComplianceEvaluationResult } from '@conform-plus/shared';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  FileDown,
  Loader2,
  Building2,
  MapPin,
  Users,
  ShieldAlert,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { useDuerpWizard } from '@/hooks/useDuerpWizard';

interface StepValidationProps {
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

function getSectorLabel(value: string): string {
  const sector = SECTORS.find((s) => s.value === value);
  return sector?.label ?? value;
}

export function StepValidation({ wizard }: StepValidationProps) {
  const router = useRouter();
  const { data: companyDetail } = useCompany(wizard.companyId);
  const { data: sites } = useSites(wizard.companyId);
  const selectedSite = sites?.find((s) => s.id === wizard.siteId);

  const createDuerp = useCreateDuerp();
  const addWorkUnit = useAddWorkUnit();
  const addRisk = useAddRisk();
  const addActionPlan = useAddActionPlan();
  const validateDuerp = useValidateDuerp();

  const [certified, setCertified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);

  const totalRisks = wizard.workUnits.reduce((sum, wu) => sum + wu.risks.length, 0);
  const totalActions = wizard.actionPlans.length;

  const failedRules = wizard.complianceResult?.results.filter((r) => !r.passed) ?? [];
  const hasFailedRules = failedRules.length > 0;

  const handleValidateAndFinalize = async () => {
    if (!certified || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Create DUERP
      const duerp = await createDuerp.mutateAsync({
        company_id: wizard.companyId,
        site_id: wizard.siteId || undefined,
      });

      // 2. Create work units and risks
      for (const wu of wizard.workUnits) {
        const createdWu = await addWorkUnit.mutateAsync({
          duerpId: duerp.id,
          data: { name: wu.name, description: wu.description || undefined },
        });

        for (const risk of wu.risks) {
          await addRisk.mutateAsync({
            duerpId: duerp.id,
            workUnitId: (createdWu as any).id,
            data: {
              category: risk.category,
              description: risk.description,
              severity: risk.severity,
              probability: risk.probability,
              existing_measures: risk.existing_measures || undefined,
              is_rps: risk.is_rps,
            },
          });
        }
      }

      // 3. Create action plans
      for (const plan of wizard.actionPlans) {
        await addActionPlan.mutateAsync({
          duerpId: duerp.id,
          data: {
            name: plan.name,
            description: plan.description || undefined,
            priority: plan.priority,
            responsible: plan.responsible || undefined,
            deadline: plan.deadline || undefined,
            is_critical: plan.is_critical,
          },
        });
      }

      // 4. Validate DUERP
      await validateDuerp.mutateAsync(duerp.id);

      setIsValidated(true);

      // Clean up wizard state
      wizard.reset();

      // Redirect after short delay
      setTimeout(() => {
        router.push(`/duerp/${duerp.id}`);
      }, 2000);
    } catch (err: any) {
      setSubmitError(err.message || 'Erreur lors de la creation du DUERP');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidated) {
    return (
      <div className="py-12 text-center space-y-4">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
        <h2 className="text-xl font-semibold">DUERP valide avec succes !</h2>
        <p className="text-sm text-muted-foreground">
          Vous allez etre redirige vers la page du document...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Etape 4 : Validation</h2>
        <p className="text-sm text-muted-foreground">
          Verifiez les informations saisies avant de finaliser le Document Unique.
        </p>
      </div>

      {/* Company Info Section */}
      <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Building2 className="h-4 w-4" />
          Informations de l'entreprise
        </h3>
        {companyDetail && (
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
              <span className="text-muted-foreground">Secteur : </span>
              <span>{getSectorLabel(companyDetail.sector)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Effectifs : </span>
              <span>{companyDetail.employee_count} salarie(s)</span>
            </div>
            <div>
              <span className="text-muted-foreground">Site physique : </span>
              <span>{companyDetail.has_physical_site ? 'Oui' : 'Non'}</span>
            </div>
            {selectedSite && (
              <div>
                <span className="text-muted-foreground">Site : </span>
                <span>
                  {selectedSite.name}
                  {selectedSite.city ? ` (${selectedSite.city})` : ''}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Work Units & Risks Summary */}
      <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <ShieldAlert className="h-4 w-4" />
          Unites de travail et risques ({wizard.workUnits.length} UT, {totalRisks} risques)
        </h3>
        {wizard.workUnits.map((wu, index) => (
          <div key={wu.id} className="rounded-md border bg-background p-3 space-y-2">
            <p className="font-medium text-sm">
              <span className="text-muted-foreground">UT{index + 1} :</span> {wu.name}
              {wu.description && (
                <span className="text-muted-foreground"> - {wu.description}</span>
              )}
            </p>
            {wu.risks.length > 0 && (
              <div className="ml-4 space-y-1">
                {wu.risks.map((risk, rIndex) => {
                  const score = getRiskScore(risk.severity, risk.probability);
                  return (
                    <div
                      key={risk.id}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-2 py-0.5 font-medium',
                          getRiskColor(score)
                        )}
                      >
                        {getRiskLabel(score)} ({score})
                      </span>
                      <span className="text-muted-foreground">
                        {risk.category}
                        {risk.is_rps && (
                          <span className="ml-1 text-purple-600 font-medium">[RPS]</span>
                        )}
                      </span>
                      <span className="truncate">{risk.description}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Plans Summary */}
      <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <ClipboardList className="h-4 w-4" />
          Plan d'actions ({totalActions} actions)
        </h3>
        {wizard.actionPlans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">
                    Action
                  </th>
                  <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">
                    Priorite
                  </th>
                  <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">
                    Responsable
                  </th>
                  <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">
                    Echeance
                  </th>
                  <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {wizard.actionPlans.map((plan) => (
                  <tr key={plan.id} className="border-b last:border-0">
                    <td className="px-2 py-1.5">
                      {plan.name}
                      {plan.is_critical && (
                        <span className="ml-1 text-red-600 font-medium">[Critique]</span>
                      )}
                    </td>
                    <td className="px-2 py-1.5">
                      {PRIORITY_LABELS[plan.priority as keyof typeof PRIORITY_LABELS] ?? plan.priority}
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground">
                      {plan.responsible || '-'}
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground">
                      {plan.deadline
                        ? new Date(plan.deadline).toLocaleDateString('fr-FR')
                        : '-'}
                    </td>
                    <td className="px-2 py-1.5">
                      {ACTION_STATUS_LABELS[plan.status as keyof typeof ACTION_STATUS_LABELS] ?? plan.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucune action definie.</p>
        )}
      </div>

      {/* Compliance Results */}
      {wizard.complianceResult && (
        <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4" />
            Evaluation de conformite
          </h3>
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full border-4',
                wizard.complianceResult.passedRules / wizard.complianceResult.totalRules >= 0.8
                  ? 'text-green-600 border-green-500'
                  : wizard.complianceResult.passedRules / wizard.complianceResult.totalRules >= 0.5
                    ? 'text-yellow-600 border-yellow-500'
                    : 'text-red-600 border-red-500'
              )}
            >
              <span className="text-sm font-bold">
                {wizard.complianceResult.totalRules > 0
                  ? Math.round(
                      (wizard.complianceResult.passedRules / wizard.complianceResult.totalRules) * 100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="text-sm">
              <p>
                <span className="font-medium">{wizard.complianceResult.passedRules}</span> /{' '}
                {wizard.complianceResult.totalRules} regles respectees
              </p>
              <p className="text-muted-foreground">Score : {wizard.complianceResult.score}</p>
            </div>
          </div>

          {wizard.complianceResult.results
            .filter((r) => !r.passed)
            .map((r, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-start gap-2 rounded-md p-2 text-sm',
                  r.severity === 'critical'
                    ? 'bg-red-50 text-red-800'
                    : 'bg-yellow-50 text-yellow-800'
                )}
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <span className="font-medium">{r.ruleName}</span> - {r.message}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Warnings */}
      {hasFailedRules && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Attention</p>
              <p className="text-sm text-red-700">
                {failedRules.length} regle(s) de conformite non respectee(s). Vous pouvez
                neanmoins valider le DUERP, mais il est recommande de corriger ces points.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Certification Checkbox */}
      <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
        <input
          type="checkbox"
          id="certification"
          checked={certified}
          onChange={(e) => setCertified(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="certification" className="text-sm">
          Je certifie l'exactitude des informations saisies dans ce Document Unique d'Evaluation
          des Risques Professionnels et m'engage a mettre en oeuvre les actions de prevention
          definies dans le plan d'actions.
        </label>
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{submitError}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleValidateAndFinalize}
          disabled={!certified || isSubmitting}
          className={cn(
            'inline-flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-medium transition-colors',
            certified && !isSubmitting
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'cursor-not-allowed bg-green-600/50 text-white/70'
          )}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {isSubmitting ? 'Validation en cours...' : 'Valider et finaliser'}
        </button>

        <button
          type="button"
          disabled={!isValidated}
          className={cn(
            'inline-flex items-center gap-2 rounded-md border border-input px-4 py-2.5 text-sm font-medium transition-colors',
            isValidated
              ? 'bg-background hover:bg-accent hover:text-accent-foreground'
              : 'cursor-not-allowed opacity-50 bg-background text-muted-foreground'
          )}
        >
          <FileDown className="h-4 w-4" />
          Exporter en PDF
        </button>
      </div>
    </div>
  );
}
