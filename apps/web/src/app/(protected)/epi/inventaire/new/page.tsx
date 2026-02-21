'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useCreateEpiItem } from '@/hooks/useEpi';
import { EpiItemForm } from '@/components/epi/EpiItemForm';

export default function NewEpiItemPage() {
  const router = useRouter();
  const createItem = useCreateEpiItem();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/epi/inventaire" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nouvel equipement EPI</h1>
          <p className="text-xs text-muted-foreground">
            Les dates d&apos;expiration et de prochain controle seront calculees automatiquement.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <EpiItemForm
          isSubmitting={createItem.isPending}
          submitLabel="Creer l'equipement"
          onSubmit={(data) => {
            createItem.mutate(data as any, {
              onSuccess: () => router.push('/epi/inventaire'),
            });
          }}
          onCancel={() => router.push('/epi/inventaire')}
        />
      </div>
    </div>
  );
}
