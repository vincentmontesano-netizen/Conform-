'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useDuerpVersions } from '@/hooks/useDuerp';
import type { DuerpVersion } from '@conform-plus/shared';
import { Loader2, History, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DuerpVersionsPage() {
  const params = useParams();
  const duerpId = params.duerpId as string;
  const { data, isLoading, error } = useDuerpVersions(duerpId);
  const versions = data as DuerpVersion[] | undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Historique des versions</h1>
          <p className="text-sm text-muted-foreground">
            Consultez l'historique des modifications du DUERP.
          </p>
        </div>
        <Link
          href={`/duerp/${duerpId}`}
          className={cn(
            'inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium',
            'hover:bg-accent hover:text-accent-foreground transition-colors'
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au DUERP
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Erreur lors du chargement des versions : {(error as Error).message}
          </p>
        </div>
      )}

      {!isLoading && !error && versions && versions.length === 0 && (
        <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
          <History className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold">Aucune version</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Aucune version n'a encore ete enregistree pour ce document.
          </p>
        </div>
      )}

      {!isLoading && !error && versions && versions.length > 0 && (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Version
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Cree par
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Signe
                  </th>
                </tr>
              </thead>
              <tbody>
                {versions.map((version) => (
                  <tr
                    key={version.id}
                    className="border-b transition-colors hover:bg-muted/50 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">
                      v{version.version_number}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(version.created_at)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {version.created_by}
                    </td>
                    <td className="px-4 py-3">
                      {version.is_signed ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Oui
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <XCircle className="h-4 w-4" />
                          Non
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
