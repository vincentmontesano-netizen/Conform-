'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AuditLog } from '@conform-plus/shared';
import { Loader2, ScrollText, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatAction(action: string): string {
  const actionLabels: Record<string, string> = {
    create: 'Creation',
    update: 'Modification',
    delete: 'Suppression',
    validate: 'Validation',
    sign: 'Signature',
    export: 'Export',
    login: 'Connexion',
    logout: 'Deconnexion',
  };
  return actionLabels[action] ?? action;
}

function formatEntityType(type: string): string {
  const typeLabels: Record<string, string> = {
    duerp: 'DUERP',
    company: 'Entreprise',
    site: 'Site',
    work_unit: 'Unite de travail',
    risk: 'Risque',
    action_plan: 'Plan d\'actions',
    user: 'Utilisateur',
    alert: 'Alerte',
  };
  return typeLabels[type] ?? type;
}

interface PaginatedResponse {
  data: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}

function useAuditLogs(page: number) {
  return useQuery({
    queryKey: ['audit-logs', page],
    queryFn: () =>
      api.get<PaginatedResponse | AuditLog[]>(
        `/audit-logs?page=${page}&pageSize=${PAGE_SIZE}`
      ),
  });
}

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const { data: response, isLoading, error } = useAuditLogs(page);

  // Handle both paginated and non-paginated responses
  const logs: AuditLog[] = Array.isArray(response)
    ? response
    : (response as PaginatedResponse)?.data ?? [];
  const total = Array.isArray(response)
    ? response.length
    : (response as PaginatedResponse)?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Journal d'audit</h1>
        <p className="text-sm text-muted-foreground">
          Historique complet des actions effectuees dans l'application.
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
            Erreur lors du chargement du journal d'audit : {(error as Error).message}
          </p>
        </div>
      )}

      {!isLoading && !error && logs.length === 0 && (
        <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
          <ScrollText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold">Aucune entree</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Le journal d'audit est vide pour le moment.
          </p>
        </div>
      )}

      {!isLoading && !error && logs.length > 0 && (
        <>
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Utilisateur
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Type entite
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b transition-colors hover:bg-muted/50 last:border-0"
                    >
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {log.user_id ? (
                          <span className="font-medium">{log.user_id}</span>
                        ) : (
                          <span className="text-muted-foreground">Systeme</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                            log.action === 'create' && 'bg-green-100 text-green-700',
                            log.action === 'update' && 'bg-blue-100 text-blue-700',
                            log.action === 'delete' && 'bg-red-100 text-red-700',
                            log.action === 'validate' && 'bg-purple-100 text-purple-700',
                            !['create', 'update', 'delete', 'validate'].includes(log.action) &&
                              'bg-gray-100 text-gray-700'
                          )}
                        >
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatEntityType(log.entity_type)}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        {log.details ? (
                          <pre className="text-xs text-muted-foreground truncate">
                            {JSON.stringify(log.details)}
                          </pre>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} sur {totalPages}
              {total > 0 && <span> ({total} entrees au total)</span>}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={cn(
                  'inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium',
                  'hover:bg-accent hover:text-accent-foreground transition-colors',
                  page <= 1 && 'cursor-not-allowed opacity-50'
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                Precedent
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className={cn(
                  'inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium',
                  'hover:bg-accent hover:text-accent-foreground transition-colors',
                  page >= totalPages && 'cursor-not-allowed opacity-50'
                )}
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
