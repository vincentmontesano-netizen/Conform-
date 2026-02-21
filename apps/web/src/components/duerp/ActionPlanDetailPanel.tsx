'use client';

import { useState } from 'react';
import {
  X,
  MessageSquare,
  Clock,
  ArrowRight,
  Upload,
  Loader2,
  FileText,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PRIORITY_LABELS,
  ACTION_STATUS_LABELS,
  ACTION_CATEGORY_LABELS,
} from '@conform-plus/shared';
import { useActionPlanLogs, useAddActionPlanLog } from '@/hooks/useActionPlanLogs';
import { useUploadProof } from '@/hooks/useUpload';
import { useUpdateActionPlan } from '@/hooks/useDuerp';

interface ActionPlanDetailPanelProps {
  duerpId: string;
  plan: {
    id: string;
    name: string;
    description?: string;
    priority: string;
    status: string;
    responsible?: string;
    deadline?: string;
    budget_estimate?: number;
    resources?: string;
    category?: string;
    completion_percentage?: number;
    is_critical?: boolean;
    proof_url?: string;
  };
  onClose: () => void;
}

export function ActionPlanDetailPanel({
  duerpId,
  plan,
  onClose,
}: ActionPlanDetailPanelProps) {
  const { data: logs, isLoading: logsLoading } = useActionPlanLogs(duerpId, plan.id);
  const addLog = useAddActionPlanLog();
  const uploadProof = useUploadProof();
  const updatePlan = useUpdateActionPlan();
  const [newComment, setNewComment] = useState('');

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await addLog.mutateAsync({
        duerpId,
        planId: plan.id,
        comment: newComment.trim(),
      });
      setNewComment('');
    } catch {
      // Error handled by mutation
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updatePlan.mutateAsync({
        duerpId,
        planId: plan.id,
        data: { status: newStatus },
      });
    } catch {
      // Error handled by mutation
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadProof.mutateAsync(file);
      await updatePlan.mutateAsync({
        duerpId,
        planId: plan.id,
        data: { proof_url: result.url },
      });
    } catch {
      // Error handled by mutation
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getLogIcon = (eventType: string) => {
    switch (eventType) {
      case 'status_change':
        return <ArrowRight className="h-3.5 w-3.5 text-blue-500" />;
      case 'comment':
        return <MessageSquare className="h-3.5 w-3.5 text-green-500" />;
      case 'proof_uploaded':
        return <Upload className="h-3.5 w-3.5 text-purple-500" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const getLogMessage = (log: any) => {
    switch (log.event_type) {
      case 'status_change': {
        const prev = log.previous_value?.status || '?';
        const next = log.new_value?.status || '?';
        const prevLabel = ACTION_STATUS_LABELS[prev as keyof typeof ACTION_STATUS_LABELS] || prev;
        const nextLabel = ACTION_STATUS_LABELS[next as keyof typeof ACTION_STATUS_LABELS] || next;
        return `Statut change : ${prevLabel} → ${nextLabel}`;
      }
      case 'comment':
        return log.comment;
      case 'proof_uploaded':
        return 'Preuve jointe ajoutee';
      case 'proof_removed':
        return 'Preuve jointe supprimee';
      default:
        return log.comment || 'Evenement';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-md border-l bg-background shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
          <h3 className="text-sm font-semibold truncate pr-4">{plan.name}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Status + Quick change */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Statut</label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(ACTION_STATUS_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleStatusChange(value)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    plan.status === value
                      ? 'bg-primary text-primary-foreground'
                      : 'border bg-background text-muted-foreground hover:bg-muted'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm">
            {plan.description && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">Description</span>
                <p className="mt-0.5">{plan.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs font-medium text-muted-foreground">Priorite</span>
                <p className="mt-0.5 text-sm">
                  {PRIORITY_LABELS[plan.priority as keyof typeof PRIORITY_LABELS] || plan.priority}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Responsable</span>
                <p className="mt-0.5 text-sm">{plan.responsible || '-'}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Echeance</span>
                <p className="mt-0.5 text-sm">
                  {plan.deadline
                    ? new Date(plan.deadline).toLocaleDateString('fr-FR')
                    : '-'}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Categorie</span>
                <p className="mt-0.5 text-sm">
                  {ACTION_CATEGORY_LABELS[plan.category as keyof typeof ACTION_CATEGORY_LABELS] || plan.category || '-'}
                </p>
              </div>
              {plan.budget_estimate !== undefined && plan.budget_estimate !== null && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Budget</span>
                  <p className="mt-0.5 text-sm">{plan.budget_estimate} EUR</p>
                </div>
              )}
              {plan.resources && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Ressources</span>
                  <p className="mt-0.5 text-sm">{plan.resources}</p>
                </div>
              )}
            </div>

            {/* Progress */}
            {plan.completion_percentage !== undefined && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Avancement : {plan.completion_percentage}%
                </span>
                <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${plan.completion_percentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Proof Upload */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Preuve
            </h4>
            {plan.proof_url ? (
              <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-xs truncate">{plan.proof_url.split('/').pop()}</span>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed p-4 text-center hover:bg-muted/30 transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {uploadProof.isPending ? 'Upload en cours...' : 'Cliquez pour joindre une preuve (PDF, PNG, JPG)'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadProof.isPending}
                />
              </label>
            )}
          </div>

          {/* Activity Log */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Journal d&apos;activite
            </h4>

            {/* Add comment */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Ajouter un commentaire..."
                className={cn(
                  'flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm',
                  'placeholder:text-muted-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                )}
              />
              <button
                type="button"
                onClick={handleAddComment}
                disabled={!newComment.trim() || addLog.isPending}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  newComment.trim() && !addLog.isPending
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'cursor-not-allowed bg-primary/50 text-primary-foreground/70'
                )}
              >
                {addLog.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MessageSquare className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {/* Logs list */}
            {logsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : logs && (logs as any[]).length > 0 ? (
              <div className="space-y-2">
                {(logs as any[]).map((log: any) => (
                  <div key={log.id} className="flex gap-2 text-xs">
                    <div className="mt-0.5">{getLogIcon(log.event_type)}</div>
                    <div className="flex-1">
                      <p className="text-foreground">{getLogMessage(log)}</p>
                      <p className="text-muted-foreground">{formatDate(log.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-xs text-muted-foreground">
                Aucune activite enregistree.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
