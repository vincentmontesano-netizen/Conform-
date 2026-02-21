'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEpiCategories } from '@/hooks/useEpi';
import { EPI_ETAT_LABELS, EPI_STATUT_LABELS, EpiEtat, EpiStatut } from '@conform-plus/shared';

interface EpiItemFormProps {
  initialData?: Record<string, unknown>;
  isSubmitting: boolean;
  submitLabel?: string;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export function EpiItemForm({
  initialData,
  isSubmitting,
  submitLabel = 'Creer',
  onSubmit,
  onCancel,
}: EpiItemFormProps) {
  const { data: categories } = useEpiCategories();
  const [form, setForm] = useState<Record<string, unknown>>({
    category_id: '',
    reference: '',
    taille: '',
    date_achat: '',
    date_fabrication: '',
    date_mise_en_service: '',
    etat: EpiEtat.NEUF,
    statut: EpiStatut.EN_STOCK,
    quantite: 1,
    notes: '',
    ...initialData,
  });

  const update = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clean empty strings
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(form)) {
      if (v !== '' && v !== null && v !== undefined) {
        cleaned[k] = v;
      }
    }
    onSubmit(cleaned);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Categorie */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Categorie <span className="text-destructive">*</span>
          </label>
          <select
            required
            value={String(form.category_id || '')}
            onChange={(e) => update('category_id', e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Selectionnez une categorie</option>
            {(categories || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.norme ? `(${c.norme})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Reference / N de serie
          </label>
          <input
            type="text"
            value={String(form.reference || '')}
            onChange={(e) => update('reference', e.target.value)}
            placeholder="Ex: CASQ-2024-001"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Taille</label>
          <input
            type="text"
            value={String(form.taille || '')}
            onChange={(e) => update('taille', e.target.value)}
            placeholder="Ex: M, L, 42..."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Date d&apos;achat
          </label>
          <input
            type="date"
            value={String(form.date_achat || '')}
            onChange={(e) => update('date_achat', e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Date de fabrication
          </label>
          <input
            type="date"
            value={String(form.date_fabrication || '')}
            onChange={(e) => update('date_fabrication', e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Date de mise en service
          </label>
          <input
            type="date"
            value={String(form.date_mise_en_service || '')}
            onChange={(e) => update('date_mise_en_service', e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Etat, statut, quantite */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Etat</label>
          <select
            value={String(form.etat || 'neuf')}
            onChange={(e) => update('etat', e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {Object.entries(EPI_ETAT_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Statut</label>
          <select
            value={String(form.statut || 'en_stock')}
            onChange={(e) => update('statut', e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {Object.entries(EPI_STATUT_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Quantite</label>
          <input
            type="number"
            min={1}
            value={Number(form.quantite || 1)}
            onChange={(e) => update('quantite', parseInt(e.target.value, 10) || 1)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
        <textarea
          rows={3}
          value={String(form.notes || '')}
          onChange={(e) => update('notes', e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none"
          placeholder="Remarques, observations..."
        />
      </div>

      {/* Actions */}
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
          disabled={isSubmitting || !form.category_id}
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
