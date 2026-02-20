'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ComplianceAlert } from '@conform-plus/shared';
import { Bell, Loader2, CheckCircle2, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';

const SEVERITY_CONFIG: Record<string, { color: string; icon: typeof Info; label: string }> = {
  info: {
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: Info,
    label: 'Information',
  },
  warning: {
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    icon: AlertTriangle,
    label: 'Avertissement',
  },
  critical: {
    color: 'bg-red-100 text-red-700 border-red-300',
    icon: AlertOctagon,
    label: 'Critique',
  },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.get<ComplianceAlert[]>('/alerts'),
  });
}

function useResolveAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => api.patch(`/alerts/${alertId}/resolve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export default function AlertsPage() {
  const { data: alerts, isLoading, error } = useAlerts();
  const resolveAlert = useResolveAlert();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alertes de conformite</h1>
        <p className="text-sm text-muted-foreground">
          Consultez et gerez les alertes de conformite generees par le moteur de regles.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Erreur lors du chargement des alertes : {error.message}
          </p>
        </div>
      )}

      {!isLoading && !error && alerts && alerts.length === 0 && (
        <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold">Aucune alerte</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Aucune alerte de conformite pour le moment. Tout est en ordre.
          </p>
        </div>
      )}

      {!isLoading && !error && alerts && alerts.length > 0 && (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Message
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Severite
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => {
                  const severityConfig = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.info;
                  const SeverityIcon = severityConfig.icon;

                  return (
                    <tr
                      key={alert.id}
                      className="border-b transition-colors hover:bg-muted/50 last:border-0"
                    >
                      <td className="px-4 py-3 font-medium">
                        {alert.rule_type}
                      </td>
                      <td className="px-4 py-3 max-w-md">
                        <p className="truncate text-muted-foreground">{alert.message}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                            severityConfig.color
                          )}
                        >
                          <SeverityIcon className="h-3 w-3" />
                          {severityConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(alert.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {alert.is_resolved ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Resolu
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-orange-600 text-xs font-medium">
                            Non resolu
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!alert.is_resolved && (
                          <button
                            type="button"
                            onClick={() => resolveAlert.mutate(alert.id)}
                            disabled={resolveAlert.isPending}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white',
                              'hover:bg-green-700 transition-colors',
                              resolveAlert.isPending && 'cursor-not-allowed opacity-50'
                            )}
                          >
                            {resolveAlert.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            Resoudre
                          </button>
                        )}
                        {alert.is_resolved && alert.resolved_at && (
                          <span className="text-xs text-muted-foreground">
                            {formatDate(alert.resolved_at)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
