'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useCreateEpiControle } from '@/hooks/useEpi';
import { EpiControleForm } from '@/components/epi/EpiControleForm';

interface NewEpiControleClientProps {
  initialItemId?: string;
}

export default function NewEpiControleClient({ initialItemId }: NewEpiControleClientProps) {
  const router = useRouter();
  const createControle = useCreateEpiControle();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/epi/controles"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nouveau controle</h1>
          <p className="text-xs text-muted-foreground">
            Enregistrer une verification periodique. Si le resultat est &quot;Non conforme&quot;, l&apos;EPI passera automatiquement en etat &quot;A remplacer&quot;.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <EpiControleForm
          initialItemId={initialItemId}
          isSubmitting={createControle.isPending}
          onSubmit={(data) => {
            createControle.mutate(data as any, {
              onSuccess: () => router.push('/epi/controles'),
            });
          }}
          onCancel={() => router.push('/epi/controles')}
        />
      </div>
    </div>
  );
}
