'use client';

import { useState, useCallback } from 'react';
import { Loader2, Upload, X, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RegistreFieldDef } from '@conform-plus/shared';

interface RegistreEntryFormProps {
  fields: RegistreFieldDef[];
  initialData?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function RegistreEntryForm({
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Enregistrer',
}: RegistreEntryFormProps) {
  const [data, setData] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    for (const field of fields) {
      init[field.name] = initialData[field.name] ?? (field.type === 'boolean' ? false : '');
    }
    return init;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openHelp, setOpenHelp] = useState<string | null>(null);

  const updateField = useCallback((name: string, value: unknown) => {
    setData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      if (field.required && !data[field.name] && data[field.name] !== false) {
        newErrors[field.name] = `${field.label} est requis`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.name}
            className={cn(
              field.type === 'textarea' && 'sm:col-span-2'
            )}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <label
                htmlFor={field.name}
                className="text-xs font-medium text-foreground"
              >
                {field.label}
                {field.required && <span className="text-destructive ml-0.5">*</span>}
              </label>
              {field.helpText && (
                <button
                  type="button"
                  className="relative"
                  onClick={() => setOpenHelp(openHelp === field.name ? null : field.name)}
                >
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-foreground transition-colors" />
                  {openHelp === field.name && (
                    <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-md border bg-popover p-2.5 text-xs text-popover-foreground shadow-md">
                      {field.helpText}
                    </div>
                  )}
                </button>
              )}
            </div>

            {/* Text input */}
            {(field.type === 'text' || field.type === 'email') && (
              <input
                id={field.name}
                type={field.type}
                value={(data[field.name] as string) || ''}
                onChange={(e) => updateField(field.name, e.target.value)}
                placeholder={field.placeholder}
                className={cn(
                  'input-cabinet w-full rounded-md border bg-background px-3 py-2 text-sm',
                  errors[field.name] && 'border-destructive'
                )}
              />
            )}

            {/* Number input */}
            {field.type === 'number' && (
              <input
                id={field.name}
                type="number"
                value={(data[field.name] as string) || ''}
                onChange={(e) => updateField(field.name, e.target.value ? Number(e.target.value) : '')}
                placeholder={field.placeholder}
                className={cn(
                  'input-cabinet w-full rounded-md border bg-background px-3 py-2 text-sm',
                  errors[field.name] && 'border-destructive'
                )}
              />
            )}

            {/* Date input */}
            {field.type === 'date' && (
              <input
                id={field.name}
                type="date"
                value={(data[field.name] as string) || ''}
                onChange={(e) => updateField(field.name, e.target.value)}
                className={cn(
                  'input-cabinet w-full rounded-md border bg-background px-3 py-2 text-sm',
                  errors[field.name] && 'border-destructive'
                )}
              />
            )}

            {/* Select input */}
            {field.type === 'select' && (
              <select
                id={field.name}
                value={(data[field.name] as string) || ''}
                onChange={(e) => updateField(field.name, e.target.value)}
                className={cn(
                  'input-cabinet w-full rounded-md border bg-background px-3 py-2 text-sm',
                  errors[field.name] && 'border-destructive'
                )}
              >
                <option value="">Selectionner...</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {/* Textarea */}
            {field.type === 'textarea' && (
              <textarea
                id={field.name}
                value={(data[field.name] as string) || ''}
                onChange={(e) => updateField(field.name, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className={cn(
                  'input-cabinet w-full rounded-md border bg-background px-3 py-2 text-sm resize-none',
                  errors[field.name] && 'border-destructive'
                )}
              />
            )}

            {/* Boolean (checkbox) */}
            {field.type === 'boolean' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  id={field.name}
                  type="checkbox"
                  checked={!!data[field.name]}
                  onChange={(e) => updateField(field.name, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-muted-foreground">Oui</span>
              </label>
            )}

            {errors[field.name] && (
              <p className="mt-1 text-[10px] text-destructive">{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t">
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
            'hover:bg-primary/90 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
