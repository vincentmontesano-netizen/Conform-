'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EpiCategoryFormProps {
  initialData?: Record<string, unknown>;
  isSubmitting: boolean;
  submitLabel?: string;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export function EpiCategoryForm({
  initialData,
  isSubmitting,
  submitLabel = 'Creer',
  onSubmit,
  onCancel,
}: EpiCategoryFormProps) {
  const [form, setForm] = useState<Record<string, unknown>>({
    name: '',
    code: '',
    description: '',
    norme: '',
    duree_vie_mois: '',
    controle_periodique_mois: '',
    ...initialData,
  });

  const update = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(form)) {
      if (v !== '' && v !== null && v !== undefined) {
        if (k === 'duree_vie_mois' || k === 'controle_periodique_mois') {
          cleaned[k] = Number(v);
        } else {
          cleaned[k] = v;
        }
      }
    }
    onSubmit(cleaned);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Nom <span className="text-destructive">*</span>
          </label>
          <input
            required
            type="text"
            value={String(form.name || '')}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Ex: Protection de la tete"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Code</label>
          <input
            type="text"
            value={String(form.code || '')}
            onChange={(e) => update('code', e.target.value.toUpperCase())}
            placeholder="Ex: TETE"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Norme europeenne
          </label>
          <input
            type="text"
            value={String(form.norme || '')}
            onChange={(e) => update('norme', e.target.value)}
            placeholder="Ex: EN 397"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
        <textarea
          rows={2}
          value={String(form.description || '')}
          onChange={(e) => update('description', e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none"
          placeholder="Description de la categorie..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Duree de vie (mois)
          </label>
          <input
            type="number"
            min={1}
            value={String(form.duree_vie_mois || '')}
            onChange={(e) => update('duree_vie_mois', e.target.value)}
            placeholder="Ex: 48"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Controle periodique (mois)
          </label>
          <input
            type="number"
            min={1}
            value={String(form.controle_periodique_mois || '')}
            onChange={(e) => update('controle_periodique_mois', e.target.value)}
            placeholder="Ex: 12"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !form.name}
          className={cn(
            'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
            'hover:bg-primary/90 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
