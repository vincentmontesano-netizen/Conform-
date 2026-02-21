'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Plus,
  FileText,
  Archive,
  ChevronDown,
  ChevronUp,
  Trash2,
  Pencil,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useRegistres,
  useCreateRegistre,
  useRegistreEntries,
  useUpdateRegistreEntry,
  useArchiveRegistreEntry,
} from '@/hooks/useRegistre';
import { RegistreExpiryBadge } from '@/components/registres/RegistreExpiryBadge';
import { RegistreEntryForm } from '@/components/registres/RegistreEntryForm';
import {
  REGISTRE_TEMPLATES,
  RegistreType,
  REGISTRE_TYPE_LABELS,
} from '@conform-plus/shared';

export default function RegistreTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = use(params);
  const registreType = type as RegistreType;
  const template = REGISTRE_TEMPLATES[registreType];

  const [showArchived, setShowArchived] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);

  const { data: registres, isLoading: loadingRegistres } = useRegistres(type);
  const registre = registres?.[0];

  const createRegistre = useCreateRegistre();
  const { data: entriesData, isLoading: loadingEntries } = useRegistreEntries(
    registre?.id || '',
    { archived: showArchived ? undefined : false }
  );
  const updateEntry = useUpdateRegistreEntry();
  const archiveEntry = useArchiveRegistreEntry();

  if (!template) {
    return (
      <div className="py-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Type de registre inconnu</h3>
        <Link href="/registres" className="mt-2 text-sm text-primary hover:underline">
          Retour aux registres
        </Link>
      </div>
    );
  }

  if (loadingRegistres) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  // Auto-create if doesn't exist
  if (!registre) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold">{template.label}</h2>
        <p className="text-sm text-muted-foreground">{template.description}</p>
        <p className="text-xs text-muted-foreground/70">{template.legalRef}</p>
        <button
          onClick={() =>
            createRegistre.mutate({
              type,
              name: template.label,
              description: template.description,
            })
          }
          disabled={createRegistre.isPending}
          className="btn-accent text-sm"
        >
          {createRegistre.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Initialiser ce registre
        </button>
      </div>
    );
  }

  const entries = entriesData?.entries || [];
  const total = entriesData?.total || 0;

  // Display first 3-4 fields as table columns
  const displayFields = template.fields.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{template.label}</h1>
          </div>
          <p className="text-xs text-muted-foreground">{template.legalRef}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/registres/${type}/new`}
            className={cn(
              'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
              'hover:bg-primary/90 transition-colors'
            )}
          >
            <Plus className="h-4 w-4" />
            Nouvelle entree
          </Link>
          <Link
            href={`/registres/${type}/export`}
            className={cn(
              'inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium',
              'hover:bg-accent hover:text-accent-foreground transition-colors'
            )}
          >
            <Download className="h-4 w-4" />
            Exporter
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowArchived(false)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            !showArchived ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
          )}
        >
          Actives ({total})
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            showArchived ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
          )}
        >
          <Archive className="mr-1 inline h-3 w-3" />
          Archivees
        </button>
      </div>

      {/* Entries table */}
      {loadingEntries ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Aucune entree</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {showArchived
              ? 'Aucune entree archivee.'
              : 'Commencez par ajouter une premiere entree a ce registre.'}
          </p>
          {!showArchived && (
            <Link
              href={`/registres/${type}/new`}
              className="btn-accent mt-4 inline-flex text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter une entree
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="w-10 px-3 py-3" />
                  {displayFields.map((f) => (
                    <th key={f.name} className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {f.label}
                    </th>
                  ))}
                  {template.expiryFieldName && (
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Echeance</th>
                  )}
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const isExpanded = expandedEntry === entry.id;
                  const isEditing = editingEntry === entry.id;
                  const entryData = entry.data as Record<string, unknown>;

                  return (
                    <tr key={entry.id} className="group">
                      <td colSpan={displayFields.length + (template.expiryFieldName ? 3 : 2) + 1}>
                        <div className="border-b transition-colors hover:bg-muted/50">
                          {/* Main row */}
                          <div className="flex items-center">
                            <button
                              className="px-3 py-3"
                              onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                            {displayFields.map((f) => (
                              <div key={f.name} className="flex-1 px-4 py-3 text-sm">
                                {String(entryData[f.name] || '-')}
                              </div>
                            ))}
                            {template.expiryFieldName && (
                              <div className="flex-1 px-4 py-3">
                                <RegistreExpiryBadge expiresAt={entry.expires_at} />
                              </div>
                            )}
                            <div className="flex-1 px-4 py-3 text-xs text-muted-foreground">
                              {new Date(entry.created_at).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setEditingEntry(isEditing ? null : entry.id)}
                                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                {!entry.is_archived && (
                                  <button
                                    onClick={() =>
                                      archiveEntry.mutate({
                                        registreId: registre.id,
                                        entryId: entry.id,
                                      })
                                    }
                                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Expanded / Edit zone */}
                          {(isExpanded || isEditing) && (
                            <div className="border-t bg-muted/20 px-6 py-4">
                              {isEditing ? (
                                <RegistreEntryForm
                                  fields={template.fields}
                                  initialData={entryData}
                                  isSubmitting={updateEntry.isPending}
                                  submitLabel="Mettre a jour"
                                  onCancel={() => setEditingEntry(null)}
                                  onSubmit={(newData) => {
                                    updateEntry.mutate(
                                      {
                                        registreId: registre.id,
                                        entryId: entry.id,
                                        data: newData,
                                      },
                                      { onSuccess: () => setEditingEntry(null) }
                                    );
                                  }}
                                />
                              ) : (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                  {template.fields.map((f) => (
                                    <div key={f.name}>
                                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                        {f.label}
                                      </p>
                                      <p className="mt-0.5 text-sm">
                                        {f.type === 'boolean'
                                          ? entryData[f.name]
                                            ? 'Oui'
                                            : 'Non'
                                          : String(entryData[f.name] || '-')}
                                      </p>
                                    </div>
                                  ))}
                                  {/* Documents */}
                                  {(entry as any).registre_entry_documents?.length > 0 && (
                                    <div className="sm:col-span-2 lg:col-span-3">
                                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                                        Justificatifs
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {(entry as any).registre_entry_documents.map((doc: any) => (
                                          <a
                                            key={doc.id}
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs text-primary hover:bg-primary/5"
                                          >
                                            <FileText className="h-3 w-3" />
                                            {doc.filename.split('/').pop()}
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Back link */}
      <Link
        href="/registres"
        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
      >
        Retour aux registres
      </Link>
    </div>
  );
}
