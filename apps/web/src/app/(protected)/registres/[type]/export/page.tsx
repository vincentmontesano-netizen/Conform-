'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Loader2, FileText, Download, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRegistres, useRegistreEntries } from '@/hooks/useRegistre';
import { RegistreExpiryBadge } from '@/components/registres/RegistreExpiryBadge';
import {
  REGISTRE_TEMPLATES,
  RegistreType,
} from '@conform-plus/shared';

export default function RegistreExportPage() {
  const params = useParams();
  const type = params.type as string;
  const registreType = type as RegistreType;
  const template = REGISTRE_TEMPLATES[registreType];

  const { data: registres, isLoading } = useRegistres(type);
  const registre = registres?.[0];
  const { data: entriesData, isLoading: loadingEntries } = useRegistreEntries(
    registre?.id || '',
    { archived: false, limit: 500 }
  );

  if (!template) {
    return (
      <div className="py-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Type de registre inconnu</h3>
      </div>
    );
  }

  if (isLoading || loadingEntries) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  const entries = entriesData?.entries || [];
  const now = new Date().toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      {/* Screen-only controls */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Export — {template.label}</h1>
          <p className="text-xs text-muted-foreground">{template.legalRef}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className={cn(
              'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
              'hover:bg-primary/90 transition-colors'
            )}
          >
            <Printer className="h-4 w-4" />
            Imprimer / PDF
          </button>
          <Link
            href={`/registres/${type}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Retour
          </Link>
        </div>
      </div>

      {/* Printable content */}
      <div className="rounded-lg border bg-white p-8 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Print header */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold">{template.label}</h2>
          <p className="text-sm text-muted-foreground mt-1">{template.legalRef}</p>
          {registre && (
            <p className="text-xs text-muted-foreground mt-2">
              Entreprise : {registre.company_id} | Exporte le : {now}
            </p>
          )}
        </div>

        {/* Entries table */}
        {entries.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Aucune entree active dans ce registre.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="border px-2 py-1.5 text-left font-semibold bg-gray-50">#</th>
                  {template.fields.map((f) => (
                    <th key={f.name} className="border px-2 py-1.5 text-left font-semibold bg-gray-50">
                      {f.label}
                    </th>
                  ))}
                  {template.expiryFieldName && (
                    <th className="border px-2 py-1.5 text-left font-semibold bg-gray-50">Echeance</th>
                  )}
                  <th className="border px-2 py-1.5 text-left font-semibold bg-gray-50">Date creation</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => {
                  const entryData = entry.data as Record<string, unknown>;
                  return (
                    <tr key={entry.id}>
                      <td className="border px-2 py-1.5 text-muted-foreground">{idx + 1}</td>
                      {template.fields.map((f) => (
                        <td key={f.name} className="border px-2 py-1.5">
                          {f.type === 'boolean'
                            ? entryData[f.name]
                              ? 'Oui'
                              : 'Non'
                            : String(entryData[f.name] || '-')}
                        </td>
                      ))}
                      {template.expiryFieldName && (
                        <td className="border px-2 py-1.5">
                          <RegistreExpiryBadge expiresAt={entry.expires_at} />
                        </td>
                      )}
                      <td className="border px-2 py-1.5 text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-[10px] text-muted-foreground">
          <p>
            Document genere par Conform+ le {now} — {template.legalRef}
          </p>
          <p className="mt-1">
            Ce document constitue un extrait du registre electronique.
            L&apos;original est conserve dans le systeme Conform+ avec horodatage et audit trail complet.
          </p>
        </div>
      </div>
    </div>
  );
}
