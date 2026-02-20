'use client';

import { useDuerpWizard } from '@/hooks/useDuerpWizard';
import { StepQualification } from '@/components/duerp/StepQualification';
import { StepRiskIdentification } from '@/components/duerp/StepRiskIdentification';
import { StepActionPlan } from '@/components/duerp/StepActionPlan';
import { StepValidation } from '@/components/duerp/StepValidation';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { number: 1, label: 'Qualification' },
  { number: 2, label: 'Identification des risques' },
  { number: 3, label: 'Plan d\'actions' },
  { number: 4, label: 'Validation' },
];

export default function DuerpWizardPage() {
  const wizard = useDuerpWizard();

  if (!wizard.isHydrated) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const canGoNext = (): boolean => {
    switch (wizard.currentStep) {
      case 1:
        return !!wizard.companyId;
      case 2:
        return wizard.workUnits.length > 0 && wizard.workUnits.every((wu) => wu.name.trim() !== '');
      case 3:
        return wizard.actionPlans.length > 0;
      case 4:
        return false; // Last step, no next
      default:
        return false;
    }
  };

  const canGoBack = wizard.currentStep > 1;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Nouveau DUERP</h1>
        <p className="text-sm text-muted-foreground">
          Assistant de creation du Document Unique d'Evaluation des Risques Professionnels.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center">
        {STEPS.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                  wizard.currentStep > step.number
                    ? 'border-primary bg-primary text-primary-foreground'
                    : wizard.currentStep === step.number
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/30 bg-background text-muted-foreground'
                )}
              >
                {wizard.currentStep > step.number ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium',
                  wizard.currentStep >= step.number
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-2 h-0.5 w-16 sm:w-24',
                  wizard.currentStep > step.number
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        {wizard.currentStep === 1 && <StepQualification wizard={wizard} />}
        {wizard.currentStep === 2 && <StepRiskIdentification wizard={wizard} />}
        {wizard.currentStep === 3 && <StepActionPlan wizard={wizard} />}
        {wizard.currentStep === 4 && <StepValidation wizard={wizard} />}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => wizard.setStep(wizard.currentStep - 1)}
          disabled={!canGoBack}
          className={cn(
            'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            canGoBack
              ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
              : 'cursor-not-allowed opacity-50 border border-input bg-background text-muted-foreground'
          )}
        >
          Precedent
        </button>

        {wizard.currentStep < 4 && (
          <button
            type="button"
            onClick={() => wizard.setStep(wizard.currentStep + 1)}
            disabled={!canGoNext()}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              canGoNext()
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'cursor-not-allowed bg-primary/50 text-primary-foreground/70'
            )}
          >
            Suivant
          </button>
        )}
      </div>
    </div>
  );
}
