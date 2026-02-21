'use client';

import { useState } from 'react';
import { TRIGGER_TYPE_LABELS } from '@conform-plus/shared';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateDuerpTrigger } from '@/hooks/useDuerpTriggers';

interface TriggerCreateFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function TriggerCreateForm({ onClose, onSuccess }: TriggerCreateFormProps) {
  const createTrigger = useCreateDuerpTrigger();
  const [form, setForm] = useState({
    trigger_type: 'changement_organisation',
    title: '',
    description: '',
    occurred_at: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    try {
      await createTrigger.mutateAsync({
        trigger_type: form.trigger_type,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        occurred_at: form.occurred_at,
      });
      onSuccess?.();
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Nouveau declencheur de mise a jour</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Type de declencheur <span className="text-destructive">*</span>
            </label>
            <select
              value={form.trigger_type}
              onChange={(e) => setForm((prev) => ({ ...prev, trigger_type: e.target.value }))}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
            >
              {Object.entries(TRIGGER_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Titre <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Reorganisation du service logistique"
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Details du declencheur..."
              rows={3}
              className={cn(
                'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Date de survenance <span className="text-destructive">*</span>
            </label>
            <input
              type="date"
              value={form.occurred_at}
              onChange={(e) => setForm((prev) => ({ ...prev, occurred_at: e.target.value }))}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
            />
          </div>

          {/* Info text */}
          <p className="text-xs text-muted-foreground">
            Un declencheur non resolu oblige la mise a jour du DUERP (art. R4121-2 du Code du travail).
          </p>

          {/* Error */}
          {createTrigger.isError && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-xs text-destructive">
                {(createTrigger.error as Error)?.message || 'Erreur lors de la creation'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium',
                'hover:bg-accent hover:text-accent-foreground transition-colors'
              )}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!form.title.trim() || createTrigger.isPending}
              className={cn(
                'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                form.title.trim() && !createTrigger.isPending
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'cursor-not-allowed bg-primary/50 text-primary-foreground/70'
              )}
            >
              {createTrigger.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Creer le declencheur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
