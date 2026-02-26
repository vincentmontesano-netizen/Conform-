'use client';

import { useInspectionReadiness } from '@/hooks/useInspection';
import { InspectionModuleCard } from '@/components/inspection/InspectionModuleCard';
import { InspectionTimeline } from '@/components/inspection/InspectionTimeline';
import { ClipboardCheck, RefreshCw, AlertTriangle, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

function ScoreGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const color =
    score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/30"
        />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className={cn('transition-all duration-1000', color)}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-3xl font-bold tabular-nums', color)}>{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

export default function InspectionPage() {
  const { data, isLoading, refetch, isRefetching } = useInspectionReadiness();
  const [exporting, setExporting] = useState(false);

  async function handleExportPdf() {
    setExporting(true);
    try {
      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      const res = await fetch('/api/pdf/inspection', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error('Export echoue');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Inspection_${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Silent fail — toast can be added later
    } finally {
      setExporting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Impossible de charger les donnees d&apos;inspection</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5">
            <ClipboardCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mode Inspection</h1>
            <p className="text-sm text-muted-foreground">
              Vue unifiee de la conformite — preparation au controle
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Download className={cn('h-4 w-4', exporting && 'animate-pulse')} />
            Exporter le dossier
          </button>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', isRefetching && 'animate-spin')} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Score global + summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 rounded-lg border bg-card p-6 flex flex-col items-center justify-center">
          <ScoreGauge score={data.global_score} />
          <p className="mt-3 text-sm font-medium">Score global</p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.global_score >= 80
              ? 'Pret pour l\'inspection'
              : data.global_score >= 50
                ? 'Ameliorations necessaires'
                : 'Non-conformites critiques'}
          </p>
          {data.alerts_count > 0 && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              {data.alerts_count} alerte(s) non resolue(s)
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-3">
          <InspectionModuleCard result={data.modules.duerp} />
          <InspectionModuleCard result={data.modules.registres} />
          <InspectionModuleCard result={data.modules.epi} />
          <InspectionModuleCard result={data.modules.formations} />
        </div>
      </div>

      {/* Timeline */}
      <InspectionTimeline deadlines={data.critical_deadlines} />
    </div>
  );
}
