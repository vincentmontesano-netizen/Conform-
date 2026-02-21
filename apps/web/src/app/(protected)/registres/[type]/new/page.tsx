'use client';

import { use, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, FileText, Upload, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRegistres, useCreateRegistre, useCreateRegistreEntry, useAddRegistreDocument } from '@/hooks/useRegistre';
import { RegistreEntryForm } from '@/components/registres/RegistreEntryForm';
import {
  REGISTRE_TEMPLATES,
  RegistreType,
} from '@conform-plus/shared';

export default function NewRegistreEntryPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = use(params);
  const router = useRouter();
  const registreType = type as RegistreType;
  const template = REGISTRE_TEMPLATES[registreType];

  const { data: registres, isLoading } = useRegistres(type);
  const registre = registres?.[0];

  const createRegistre = useCreateRegistre();
  const createEntry = useCreateRegistreEntry();
  const addDocument = useAddRegistreDocument();

  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!template) {
    return (
      <div className="py-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Type de registre inconnu</h3>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      // Auto-create registre if it doesn't exist
      let registreId = registre?.id;
      if (!registreId) {
        const created = await createRegistre.mutateAsync({
          type,
          name: template.label,
          description: template.description,
        });
        registreId = created.id;
      }

      // Create entry
      const entry = await createEntry.mutateAsync({
        registreId,
        data,
      });

      // Upload files if any
      for (const file of files) {
        await addDocument.mutateAsync({
          registreId,
          entryId: (entry as any).id,
          file,
        });
      }

      router.push(`/registres/${type}`);
    } catch (err) {
      // Error handled by React Query
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Nouvelle entree</h1>
        <p className="text-sm text-muted-foreground">{template.label}</p>
      </div>

      {/* Legal info banner */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">{template.legalRef}</p>
          <p className="text-xs text-blue-700 mt-0.5">{template.description}</p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <RegistreEntryForm
          fields={template.fields}
          isSubmitting={createEntry.isPending || addDocument.isPending}
          submitLabel="Enregistrer l'entree"
          onCancel={() => router.push(`/registres/${type}`)}
          onSubmit={handleSubmit}
        />
      </div>

      {/* File upload section */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold mb-3">Justificatifs</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Ajoutez des documents justificatifs (PDF, PNG, JPG — max 10 Mo).
        </p>

        <div className="space-y-3">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-3 rounded border px-3 py-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-sm truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(0)} Ko
              </span>
              <button
                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'inline-flex items-center gap-2 rounded-md border border-dashed border-input px-4 py-2 text-sm',
              'text-muted-foreground hover:border-foreground hover:text-foreground transition-colors'
            )}
          >
            <Upload className="h-4 w-4" />
            Ajouter un justificatif
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setFiles((prev) => [...prev, e.target.files![0]]);
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>

      {/* Back link */}
      <Link
        href={`/registres/${type}`}
        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
      >
        Retour au registre
      </Link>
    </div>
  );
}
