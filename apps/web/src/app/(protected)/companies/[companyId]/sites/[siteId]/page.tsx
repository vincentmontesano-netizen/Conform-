'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { MapPin, ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { Site } from '@conform-plus/shared';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function SiteDetailPage({
  params,
}: {
  params: Promise<{ companyId: string; siteId: string }>;
}) {
  const { companyId, siteId } = use(params);

  const { data: site, isLoading, error } = useQuery({
    queryKey: ['companies', companyId, 'sites', siteId],
    queryFn: () => api.get<Site>(`/companies/${companyId}/sites/${siteId}`),
    enabled: !!companyId && !!siteId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          href={`/companies/${companyId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour a l&apos;entreprise
        </Link>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Erreur lors du chargement : {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!site) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/companies/${companyId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour a l&apos;entreprise
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{site.name}</h1>
            {site.is_main && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Site principal
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Site Info Card */}
      <div className="rounded-lg border bg-card p-6 shadow-sm max-w-2xl">
        <h2 className="text-sm font-medium text-muted-foreground">
          Informations du site
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Nom</p>
            <p className="mt-1 text-sm">{site.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Adresse</p>
            <p className="mt-1 text-sm">{site.address || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ville</p>
            <p className="mt-1 text-sm">{site.city || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Code postal</p>
            <p className="mt-1 font-mono text-sm">{site.zip_code || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Site principal</p>
            <p className="mt-1 text-sm">{site.is_main ? 'Oui' : 'Non'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Date de creation</p>
            <p className="mt-1 text-sm">{formatDate(site.created_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
