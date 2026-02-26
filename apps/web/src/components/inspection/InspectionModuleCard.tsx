'use client';

import { useState } from 'react';
import {
  FileText,
  BookOpen,
  HardHat,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InspectionModuleResult, InspectionCheck } from '@conform-plus/shared';

const MODULE_CONFIG = {
  duerp: { label: 'DUERP', icon: FileText, color: 'text-blue-400' },
  registres: { label: 'Registres', icon: BookOpen, color: 'text-purple-400' },
  epi: { label: 'EPI', icon: HardHat, color: 'text-amber-400' },
  formations: { label: 'Formations', icon: GraduationCap, color: 'text-emerald-400' },
};

function getScoreColor(score: number) {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-red-400';
}

function getScoreBgColor(score: number) {
  if (score >= 80) return 'bg-emerald-500/10';
  if (score >= 50) return 'bg-amber-500/10';
  return 'bg-red-500/10';
}

function CheckIcon({ check }: { check: InspectionCheck }) {
  if (check.passed) {
    return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
  }
  if (check.severity === 'critical') {
    return <XCircle className="h-4 w-4 text-red-400 shrink-0" />;
  }
  return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
}

interface Props {
  result: InspectionModuleResult;
}

export function InspectionModuleCard({ result }: Props) {
  const [expanded, setExpanded] = useState(false);
  const config = MODULE_CONFIG[result.module];
  const Icon = config.icon;
  const passedCount = result.checks.filter((c) => c.passed).length;

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className={cn('rounded-lg p-2.5', getScoreBgColor(result.score))}>
          <Icon className={cn('h-5 w-5', config.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{config.label}</h3>
            <span className="text-xs text-muted-foreground">
              {passedCount}/{result.checks.length} checks
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                result.score >= 80
                  ? 'bg-emerald-500'
                  : result.score >= 50
                    ? 'bg-amber-500'
                    : 'bg-red-500',
              )}
              style={{ width: `${result.score}%` }}
            />
          </div>
        </div>

        <span className={cn('text-2xl font-bold tabular-nums', getScoreColor(result.score))}>
          {result.score}%
        </span>

        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="border-t px-4 py-3 space-y-2">
          {result.checks.map((check) => (
            <div key={check.id} className="flex items-start gap-2.5 py-1">
              <CheckIcon check={check} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{check.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{check.details}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
