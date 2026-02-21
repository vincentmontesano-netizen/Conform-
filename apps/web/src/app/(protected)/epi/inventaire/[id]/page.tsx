'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  ArrowLeft,
  Pencil,
  FileText,
  Printer,
  HardHat,
  Calendar,
  Info,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEpiItem, useUpdateEpiItem } from '@/hooks/useEpi';
import { EpiStatutBadge } from '@/components/epi/EpiStatutBadge';
import { EpiEtatBadge } from '@/components/epi/EpiEtatBadge';
import { EpiExpiryBadge } from '@/components/epi/EpiExpiryBadge';
import { EpiHistoryTimeline } from '@/components/epi/EpiHistoryTimeline';
import { EpiItemForm } from '@/components/epi/EpiItemForm';

export default function EpiItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: item, isLoading } = useEpiItem(id);
  const updateItem = useUpdateEpiItem();
  const [editing, setEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="py-12 text-center">
        <HardHat className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Equipement introuvable</h3>
        <Link href="/epi/inventaire" className="mt-2 text-sm text-primary hover:underline">
          Retour a l&apos;inventaire
        </Link>
      </div>
    );
  }

  const category = item.category;
  const documents = item.documents || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              href="/epi/inventaire"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">
              {item.reference || `EPI ${item.id.slice(0, 8)}`}
            </h1>
          </div>
          {category && (
            <p className="ml-8 text-sm text-muted-foreground">
              {category.name} {category.norme ? `- ${category.norme}` : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing(!editing)}
            className={cn(
              'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium',
              'hover:bg-muted transition-colors',
            )}
          >
            {editing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            {editing ? 'Annuler' : 'Modifier'}
          </button>
          <Link
            href={`/epi/attestation/${item.id}`}
            className={cn(
              'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
              'hover:bg-primary/90 transition-colors',
            )}
          >
            <Printer className="h-4 w-4" />
            Attestation
          </Link>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Modifier l&apos;equipement</h3>
          <EpiItemForm
            initialData={{
              category_id: item.category_id,
              reference: item.reference || '',
              taille: item.taille || '',
              date_achat: item.date_achat || '',
              date_fabrication: item.date_fabrication || '',
              date_mise_en_service: item.date_mise_en_service || '',
              etat: item.etat,
              statut: item.statut,
              quantite: item.quantite,
              notes: item.notes || '',
            }}
            isSubmitting={updateItem.isPending}
            submitLabel="Mettre a jour"
            onCancel={() => setEditing(false)}
            onSubmit={(data) => {
              updateItem.mutate(
                { id: item.id, ...data },
                { onSuccess: () => setEditing(false) },
              );
            }}
          />
        </div>
      )}

      {/* Info cards */}
      {!editing && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-4 w-4 text-muted-foreground/60" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Informations
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Reference
                  </p>
                  <p className="mt-0.5 text-sm font-medium">{item.reference || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Categorie
                  </p>
                  <p className="mt-0.5 text-sm">{category?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Norme
                  </p>
                  <p className="mt-0.5 text-sm font-mono">{category?.norme || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Taille
                  </p>
                  <p className="mt-0.5 text-sm">{item.taille || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Quantite
                  </p>
                  <p className="mt-0.5 text-sm">{item.quantite}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Statut / Etat
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <EpiStatutBadge statut={item.statut} />
                    <EpiEtatBadge etat={item.etat} />
                  </div>
                </div>
              </div>
              {item.notes && (
                <div className="mt-4 rounded-md bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">{item.notes}</p>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-muted-foreground/60" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Dates
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Achat
                  </p>
                  <p className="mt-0.5 text-sm">
                    {item.date_achat
                      ? new Date(item.date_achat).toLocaleDateString('fr-FR')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Fabrication
                  </p>
                  <p className="mt-0.5 text-sm">
                    {item.date_fabrication
                      ? new Date(item.date_fabrication).toLocaleDateString('fr-FR')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Mise en service
                  </p>
                  <p className="mt-0.5 text-sm">
                    {item.date_mise_en_service
                      ? new Date(item.date_mise_en_service).toLocaleDateString('fr-FR')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Expiration
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="text-sm">
                      {item.date_expiration
                        ? new Date(item.date_expiration).toLocaleDateString('fr-FR')
                        : '-'}
                    </p>
                    <EpiExpiryBadge date={item.date_expiration} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Dernier controle
                  </p>
                  <p className="mt-0.5 text-sm">
                    {item.date_dernier_controle
                      ? new Date(item.date_dernier_controle).toLocaleDateString('fr-FR')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Prochain controle
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="text-sm">
                      {item.date_prochain_controle
                        ? new Date(item.date_prochain_controle).toLocaleDateString('fr-FR')
                        : '-'}
                    </p>
                    <EpiExpiryBadge date={item.date_prochain_controle} label="Ctrl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            {documents.length > 0 && (
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-4 w-4 text-muted-foreground/60" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Documents
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {documents.map((doc) => (
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

          {/* Timeline sidebar */}
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Historique
              </h2>
              <EpiHistoryTimeline
                attributions={item.attributions}
                controles={item.controles}
              />
            </div>

            {/* Quick actions */}
            <div className="space-y-2">
              <Link
                href={`/epi/attributions/new?epi_item_id=${item.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                Attribuer cet EPI
              </Link>
              <Link
                href={`/epi/controles/new?epi_item_id=${item.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                Enregistrer un controle
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
