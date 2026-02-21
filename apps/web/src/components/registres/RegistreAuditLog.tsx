'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2, FileText, Pencil, Archive, Upload, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  create: FileText,
  update: Pencil,
  delete: Archive,
  upload: Upload,
};

const ACTION_LABELS: Record<string, string> = {
  create: 'Creation',
  update: 'Modification',
  delete: 'Archivage',
  upload: 'Upload document',
};

interface RegistreAuditLogProps {
  entityType: 'registre' | 'registre_entry';
  entityId?: string;
  className?: string;
}

export function RegistreAuditLog({ entityType, entityId, className }: RegistreAuditLogProps) {
  const { data: logs, isLoading } = useQuery<AuditLogEntry[]>({
    queryKey: ['audit-logs', entityType, entityId],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('entity_type', entityType);
      if (entityId) params.set('entity_id', entityId);
      params.set('limit', '50');
      return api.get(`/audit-logs?${params.toString()}`);
    },
    enabled: !!entityType,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const entries = Array.isArray(logs) ? logs : [];

  if (entries.length === 0) {
    return (
      <div className={cn('py-6 text-center', className)}>
        <Clock className="mx-auto h-8 w-8 text-muted-foreground/40" />
        <p className="mt-2 text-xs text-muted-foreground">Aucune activite enregistree.</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-0', className)}>
      {entries.map((log, idx) => {
        const Icon = ACTION_ICONS[log.action] || Clock;
        const label = ACTION_LABELS[log.action] || log.action;
        const isLast = idx === entries.length - 1;

        return (
          <div key={log.id} className="flex gap-3">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border bg-card">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              {!isLast && <div className="w-px flex-1 bg-border" />}
            </div>

            {/* Content */}
            <div className={cn('pb-4', isLast && 'pb-0')}>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(log.created_at).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {log.details && (
                <p className="mt-1 text-[10px] text-muted-foreground/80 line-clamp-2">
                  {typeof log.details === 'object' && log.details.path
                    ? String(log.details.path)
                    : JSON.stringify(log.details).slice(0, 120)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
