export interface InspectionCheck {
  id: string;
  label: string;
  passed: boolean;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface InspectionModuleResult {
  module: 'duerp' | 'registres' | 'epi' | 'formations';
  score: number;
  checks: InspectionCheck[];
}

export interface InspectionDeadline {
  id: string;
  module: string;
  label: string;
  date: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface InspectionReadiness {
  global_score: number;
  modules: {
    duerp: InspectionModuleResult;
    registres: InspectionModuleResult;
    epi: InspectionModuleResult;
    formations: InspectionModuleResult;
  };
  critical_deadlines: InspectionDeadline[];
  alerts_count: number;
}
