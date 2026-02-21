'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEpiItems } from '@/hooks/useEpi';
import { EPI_CONTROLE_RESULTAT_LABELS } from '@conform-plus/shared';

interface EpiControleFormProps {
  initialItemId?: string;
  isSubmitting: boolean;
  submitLabel?: string;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export function EpiControleForm({
  initialItemId,
  isSubmitting,
  submitLabel = 'Enregistrer',
  onSubmit,
  onCancel,
}: EpiControleFormProps) {
  const { data: itemsData } = useEpiItems({ limit: 200 });
  const items = itemsData?.items || [];

  const [form, setForm] = useState({
    epi_item_id: initialItemId || '',
    date_controle: new Date().toISOString().split('T')[0],
    controleur: '',
    resultat: 'conforme',
    observations: '',
    prochain_controle: '',
  });

  const update = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(form)) {
      if (v !== '' && v !== null && v !== undefined) {
        cleaned[k] = v;
      }
    }
    onSubmit(cleaned);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* EPI selection */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Equipement EPI <span className="text-destructive">*</span>
        </label>
        <select
          required
          value={form.epi_item_id}
          onChange={(e) => update('epi_item_id', e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">Selectionnez un EPI</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.reference || item.id.slice(0, 8)} - {(item as any).epi_categories?.name || 'Sans categorie'}
              {item.taille ? ` (${item.taille})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Date & controleur */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Date du controle <span className="text-destructive">*</span>
          </label>
          <input
            required
            type="date"
            value={form.date_controle}
            onChange={(e) => update('date_controle', e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Controleur <span className="text-destructive">*</span>
          </label>
          <input
            required
            type="text"
            value={form.controleur}
            onChange={(e) => update('controleur', e.target.value)}
            placeholder="Nom du controleur"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Resultat */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Resultat <span className="text-destructive">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(EPI_CONTROLE_RESULTAT_LABELS).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => update('resultat', val)}
              className={cn(
                'rounded-md border px-4 py-2 text-sm font-medium transition-colors',
                form.resultat === val
                  ? val === 'conforme'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : val === 'non_conforme'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'hover:bg-muted',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {form.resultat === 'non_conforme' && (
          <p className="mt-2 text-xs text-destructive">
            L&apos;equipement sera automatiquement marque &quot;a remplacer&quot;.
          </p>
        )}
      </div>

      {/* Observations */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Observations</label>
        <textarea
          rows={3}
          value={form.observations}
          onChange={(e) => update('observations', e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none"
          placeholder="Observations du controle..."
        />
      </div>

      {/* Prochain controle */}
      <div className="sm:w-1/2">
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Prochain controle prevu
        </label>
        <input
          type="date"
          value={form.prochain_controle}
          onChange={(e) => update('prochain_controle', e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
        <p className="mt-1 text-[10px] text-muted-foreground">
          Si laisse vide, sera calcule automatiquement depuis la categorie.
        </p>
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
          disabled={isSubmitting || !form.epi_item_id || !form.controleur}
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
