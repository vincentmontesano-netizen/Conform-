'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEpiItems } from '@/hooks/useEpi';

interface EpiAttributionFormProps {
  initialItemId?: string;
  isSubmitting: boolean;
  submitLabel?: string;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export function EpiAttributionForm({
  initialItemId,
  isSubmitting,
  submitLabel = 'Attribuer',
  onSubmit,
  onCancel,
}: EpiAttributionFormProps) {
  const { data: itemsData } = useEpiItems({ statut: 'en_stock', limit: 200 });
  const items = itemsData?.items || [];

  const [form, setForm] = useState({
    epi_item_id: initialItemId || '',
    salarie_nom: '',
    salarie_poste: '',
    date_attribution: new Date().toISOString().split('T')[0],
    motif: '',
    attribue_par: '',
    signature_salarie: false,
    notes: '',
  });

  const update = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(form)) {
      if (v !== '' && v !== null && v !== undefined && v !== false) {
        cleaned[k] = v;
      }
    }
    // Always include required fields
    cleaned.epi_item_id = form.epi_item_id;
    cleaned.salarie_nom = form.salarie_nom;
    cleaned.date_attribution = form.date_attribution;
    cleaned.attribue_par = form.attribue_par;
    cleaned.signature_salarie = form.signature_salarie;
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
          <option value="">Selectionnez un EPI en stock</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.reference || item.id.slice(0, 8)} - {(item as any).epi_categories?.name || 'Sans categorie'}
              {item.taille ? ` (${item.taille})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Salarie info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Nom du salarie <span className="text-destructive">*</span>
          </label>
          <input
            required
            type="text"
            value={form.salarie_nom}
            onChange={(e) => update('salarie_nom', e.target.value)}
            placeholder="Ex: Jean Dupont"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Poste
          </label>
          <input
            type="text"
            value={form.salarie_poste}
            onChange={(e) => update('salarie_poste', e.target.value)}
            placeholder="Ex: Technicien maintenance"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Date & attribue par */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Date d&apos;attribution <span className="text-destructive">*</span>
          </label>
          <input
            required
            type="date"
            value={form.date_attribution}
            onChange={(e) => update('date_attribution', e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Attribue par <span className="text-destructive">*</span>
          </label>
          <input
            required
            type="text"
            value={form.attribue_par}
            onChange={(e) => update('attribue_par', e.target.value)}
            placeholder="Nom du responsable"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Motif */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Motif de remise
        </label>
        <input
          type="text"
          value={form.motif}
          onChange={(e) => update('motif', e.target.value)}
          placeholder="Ex: Prise de poste, remplacement..."
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      {/* Signature */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="signature"
          checked={form.signature_salarie}
          onChange={(e) => update('signature_salarie', e.target.checked)}
          className="rounded border"
        />
        <label htmlFor="signature" className="text-sm text-muted-foreground">
          Le salarie a signe l&apos;attestation de remise
        </label>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
        <textarea
          rows={2}
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none"
          placeholder="Observations..."
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
          disabled={isSubmitting || !form.epi_item_id || !form.salarie_nom || !form.attribue_par}
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
