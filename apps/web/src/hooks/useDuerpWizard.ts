'use client';

import { useState, useCallback, useEffect } from 'react';
import type { SeverityLevel, ProbabilityLevel, ActionPriority, ActionStatus } from '@conform-plus/shared';
import type { ComplianceEvaluationResult } from '@conform-plus/shared';

const STORAGE_KEY = 'conform-plus-duerp-wizard';

export interface WizardRisk {
  id: string;
  category: string;
  description: string;
  severity: SeverityLevel;
  probability: ProbabilityLevel;
  existing_measures: string;
  is_rps: boolean;
}

export interface WizardWorkUnit {
  id: string;
  name: string;
  description: string;
  risks: WizardRisk[];
}

export interface WizardActionPlan {
  id: string;
  name: string;
  description: string;
  priority: ActionPriority;
  responsible: string;
  deadline: string;
  status: ActionStatus;
  is_critical: boolean;
  has_proof: boolean;
  risk_id: string;
}

export interface WizardState {
  currentStep: number;
  companyId: string;
  siteId: string;
  workUnits: WizardWorkUnit[];
  actionPlans: WizardActionPlan[];
  complianceResult: ComplianceEvaluationResult | null;
}

const defaultState: WizardState = {
  currentStep: 1,
  companyId: '',
  siteId: '',
  workUnits: [],
  actionPlans: [],
  complianceResult: null,
};

function loadState(): WizardState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultState, ...parsed };
    }
  } catch {
    // ignore
  }
  return defaultState;
}

function saveState(state: WizardState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function useDuerpWizard() {
  const [state, setState] = useState<WizardState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setState(loadState());
    setIsHydrated(true);
  }, []);

  // Persist to localStorage on changes
  useEffect(() => {
    if (isHydrated) {
      saveState(state);
    }
  }, [state, isHydrated]);

  const setStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, currentStep: Math.max(1, Math.min(4, step)) }));
  }, []);

  const setCompany = useCallback((companyId: string) => {
    setState((prev) => ({ ...prev, companyId, siteId: '' }));
  }, []);

  const setSite = useCallback((siteId: string) => {
    setState((prev) => ({ ...prev, siteId }));
  }, []);

  const addWorkUnit = useCallback(() => {
    const newUnit: WizardWorkUnit = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      risks: [],
    };
    setState((prev) => ({ ...prev, workUnits: [...prev.workUnits, newUnit] }));
  }, []);

  const updateWorkUnit = useCallback((id: string, data: Partial<Omit<WizardWorkUnit, 'id' | 'risks'>>) => {
    setState((prev) => ({
      ...prev,
      workUnits: prev.workUnits.map((wu) =>
        wu.id === id ? { ...wu, ...data } : wu
      ),
    }));
  }, []);

  const removeWorkUnit = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      workUnits: prev.workUnits.filter((wu) => wu.id !== id),
      // Also remove action plans linked to risks from this work unit
      actionPlans: prev.actionPlans.filter((ap) => {
        const riskIds = prev.workUnits.find((wu) => wu.id === id)?.risks.map((r) => r.id) ?? [];
        return !riskIds.includes(ap.risk_id);
      }),
    }));
  }, []);

  const addRisk = useCallback((workUnitId: string) => {
    const newRisk: WizardRisk = {
      id: crypto.randomUUID(),
      category: '',
      description: '',
      severity: 'faible' as SeverityLevel,
      probability: 'improbable' as ProbabilityLevel,
      existing_measures: '',
      is_rps: false,
    };
    setState((prev) => ({
      ...prev,
      workUnits: prev.workUnits.map((wu) =>
        wu.id === workUnitId ? { ...wu, risks: [...wu.risks, newRisk] } : wu
      ),
    }));
  }, []);

  const updateRisk = useCallback((workUnitId: string, riskId: string, data: Partial<Omit<WizardRisk, 'id'>>) => {
    setState((prev) => ({
      ...prev,
      workUnits: prev.workUnits.map((wu) =>
        wu.id === workUnitId
          ? {
              ...wu,
              risks: wu.risks.map((r) =>
                r.id === riskId ? { ...r, ...data } : r
              ),
            }
          : wu
      ),
    }));
  }, []);

  const removeRisk = useCallback((workUnitId: string, riskId: string) => {
    setState((prev) => ({
      ...prev,
      workUnits: prev.workUnits.map((wu) =>
        wu.id === workUnitId
          ? { ...wu, risks: wu.risks.filter((r) => r.id !== riskId) }
          : wu
      ),
      actionPlans: prev.actionPlans.filter((ap) => ap.risk_id !== riskId),
    }));
  }, []);

  const addActionPlan = useCallback(() => {
    const newPlan: WizardActionPlan = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      priority: 'moyenne' as ActionPriority,
      responsible: '',
      deadline: '',
      status: 'a_faire' as ActionStatus,
      is_critical: false,
      has_proof: false,
      risk_id: '',
    };
    setState((prev) => ({ ...prev, actionPlans: [...prev.actionPlans, newPlan] }));
  }, []);

  const updateActionPlan = useCallback((id: string, data: Partial<Omit<WizardActionPlan, 'id'>>) => {
    setState((prev) => ({
      ...prev,
      actionPlans: prev.actionPlans.map((ap) =>
        ap.id === id ? { ...ap, ...data } : ap
      ),
    }));
  }, []);

  const removeActionPlan = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      actionPlans: prev.actionPlans.filter((ap) => ap.id !== id),
    }));
  }, []);

  const generateActionPlans = useCallback(() => {
    setState((prev) => {
      const allRisks = prev.workUnits.flatMap((wu) =>
        wu.risks.map((r) => ({ ...r, workUnitName: wu.name }))
      );

      const severityToPriority: Record<string, ActionPriority> = {
        faible: 'faible',
        modere: 'moyenne',
        eleve: 'haute',
        critique: 'urgente',
      };

      const generatedPlans: WizardActionPlan[] = allRisks.map((risk) => ({
        id: crypto.randomUUID(),
        name: `Action corrective - ${risk.category || 'Risque'}`,
        description: `Mesure de prevention pour : ${risk.description || risk.category} (${risk.workUnitName})`,
        priority: severityToPriority[risk.severity] || ('moyenne' as ActionPriority),
        responsible: '',
        deadline: '',
        status: 'a_faire' as ActionStatus,
        is_critical: risk.severity === 'critique' || risk.severity === 'eleve',
        has_proof: false,
        risk_id: risk.id,
      }));

      return { ...prev, actionPlans: generatedPlans };
    });
  }, []);

  const setComplianceResult = useCallback((result: ComplianceEvaluationResult | null) => {
    setState((prev) => ({ ...prev, complianceResult: result }));
  }, []);

  const reset = useCallback(() => {
    setState(defaultState);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    ...state,
    isHydrated,
    setStep,
    setCompany,
    setSite,
    addWorkUnit,
    updateWorkUnit,
    removeWorkUnit,
    addRisk,
    updateRisk,
    removeRisk,
    addActionPlan,
    updateActionPlan,
    removeActionPlan,
    generateActionPlans,
    setComplianceResult,
    reset,
  };
}
