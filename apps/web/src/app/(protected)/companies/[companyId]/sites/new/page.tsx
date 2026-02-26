'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCreateSite } from '@/hooks/useCompany';
import { createSiteSchema } from '@conform-plus/shared';
import { cn } from '@/lib/utils';
import { ZodError } from 'zod';

type FieldErrors = Record<string, string>;

export default function NewSitePage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const router = useRouter();
  const createSite = useCreateSite();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [isMain, setIsMain] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    try {
      const data = createSiteSchema.parse({
        name,
        address: address || undefined,
        city: city || undefined,
        zip_code: zipCode || undefined,
        is_main: isMain,
      });

      await createSite.mutateAsync({ companyId, data });
      router.push(`/companies/${companyId}`);
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: FieldErrors = {};
        for (const issue of err.issues) {
          const field = issue.path[0] as string;
          if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        }
        setErrors(fieldErrors);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/companies/${companyId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour a l&apos;entreprise
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Nouveau site</h1>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nom du site
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                errors.name && 'border-destructive'
              )}
              placeholder="Ex: Siege social, Entrepot Nord"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium">
              Adresse
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                errors.address && 'border-destructive'
              )}
              placeholder="12 rue de la Paix"
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address}</p>
            )}
          </div>

          {/* City and Zip code side by side */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-medium">
                Ville
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={cn(
                  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                  'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  errors.city && 'border-destructive'
                )}
                placeholder="Paris"
              />
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="zip_code" className="text-sm font-medium">
                Code postal
              </label>
              <input
                id="zip_code"
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                maxLength={5}
                className={cn(
                  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono',
                  'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  errors.zip_code && 'border-destructive'
                )}
                placeholder="75001"
              />
              {errors.zip_code && (
                <p className="text-sm text-destructive">{errors.zip_code}</p>
              )}
            </div>
          </div>

          {/* Is main */}
          <div className="flex items-center gap-2">
            <input
              id="is_main"
              type="checkbox"
              checked={isMain}
              onChange={(e) => setIsMain(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor="is_main" className="text-sm font-medium">
              Site principal
            </label>
          </div>

          {/* Server error */}
          {createSite.error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">
                {createSite.error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={createSite.isPending}
              className={cn(
                'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
                'hover:bg-primary/90 transition-colors',
                'disabled:opacity-50 disabled:pointer-events-none'
              )}
            >
              {createSite.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Creer le site
            </button>
            <Link
              href={`/companies/${companyId}`}
              className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
