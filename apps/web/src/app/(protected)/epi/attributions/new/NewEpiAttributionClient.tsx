'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useCreateEpiAttribution } from '@/hooks/useEpi';
import { EpiAttributionForm } from '@/components/epi/EpiAttributionForm';

interface NewEpiAttributionClientProps {
  initialItemId?: string;
}

export default function NewEpiAttributionClient({ initialItemId }: NewEpiAttributionClientProps) {
  const router = useRouter();
  const createAttribution = useCreateEpiAttribution();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/epi/attributions"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nouvelle attribution</h1>
          <p className="text-xs text-muted-foreground">
            Remettre un EPI a un salarie. Le statut de l&apos;equipement passera automatiquement a &quot;Attribue&quot;.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <EpiAttributionForm
          initialItemId={initialItemId}
          isSubmitting={createAttribution.isPending}
          onSubmit={(data) => {
            createAttribution.mutate(data as any, {
              onSuccess: () => router.push('/epi/attributions'),
            });
          }}
          onCancel={() => router.push('/epi/attributions')}
        />
      </div>
    </div>
  );
}
