'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ComplianceAlert, AuditLog } from '@conform-plus/shared';

// --- Dashboard ---

export interface DashboardOverview {
  sites_count: number;
  duerps_count: number;
  duerps_validated: number;
  compliance_score: number;
  unresolved_alerts: number;
  action_plans_pending: number;
  action_plans_overdue: number;
  duerps_overdue: number;
  unresolved_triggers: number;
  registres_count: number;
  registre_entries_expiring: number;
  epi_count: number;
  epi_expiring: number;
  epi_non_conforme: number;
  formations_expiring: number;
  habilitations_expiring: number;
  formation_types_count: number;
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardOverview>('/dashboard'),
  });
}

// --- Compliance Alerts ---

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.get<ComplianceAlert[]>('/compliance/alerts'),
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) =>
      api.patch(`/compliance/alerts/${alertId}/resolve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// --- Audit Logs ---

export interface PaginatedAuditLogs {
  data: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}

export function useAuditLogs(page: number, pageSize = 20) {
  return useQuery({
    queryKey: ['audit-logs', page, pageSize],
    queryFn: () =>
      api.get<PaginatedAuditLogs>(
        `/audit-logs?page=${page}&pageSize=${pageSize}`,
      ),
  });
}
