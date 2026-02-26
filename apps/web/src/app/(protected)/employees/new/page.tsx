'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useCreateEmployee } from '@/hooks/useEmployee';
import { CONTRAT_TYPE_LABELS } from '@conform-plus/shared';
import type { CreateEmployeeInput, ContratType } from '@conform-plus/shared';

export default function NewEmployeePage() {
  const router = useRouter();
  const createEmployee = useCreateEmployee();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEmployeeInput>({
    defaultValues: {
      type_contrat: 'cdi',
      date_entree: new Date().toISOString().split('T')[0],
    },
  });

  function onSubmit(data: CreateEmployeeInput) {
    createEmployee.mutate(data, {
      onSuccess: () => router.push('/employees'),
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/employees"
          className="rounded-md border p-2 hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-display text-2xl italic text-foreground">
            Nouveau salarie
          </h1>
          <p className="text-xs text-muted-foreground">
            Ajoutez un salarie a votre entreprise.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Identite */}
        <fieldset className="rounded-lg border bg-card p-5 space-y-4">
          <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
            Identite
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Nom *
              </label>
              <input
                {...register('nom', { required: 'Nom requis' })}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {errors.nom && (
                <p className="mt-1 text-xs text-red-500">{errors.nom.message}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Prenom *
              </label>
              <input
                {...register('prenom', { required: 'Prenom requis' })}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {errors.prenom && (
                <p className="mt-1 text-xs text-red-500">{errors.prenom.message}</p>
              )}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Telephone
              </label>
              <input
                {...register('telephone')}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </fieldset>

        {/* Poste */}
        <fieldset className="rounded-lg border bg-card p-5 space-y-4">
          <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
            Poste
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Poste / Fonction
              </label>
              <input
                {...register('poste')}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Departement / Service
              </label>
              <input
                {...register('departement')}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </fieldset>

        {/* Contrat */}
        <fieldset className="rounded-lg border bg-card p-5 space-y-4">
          <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
            Contrat
          </legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Type de contrat
              </label>
              <select
                {...register('type_contrat')}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {(Object.entries(CONTRAT_TYPE_LABELS) as [ContratType, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Date d&apos;entree *
              </label>
              <input
                type="date"
                {...register('date_entree', { required: "Date d'entree requise" })}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {errors.date_entree && (
                <p className="mt-1 text-xs text-red-500">{errors.date_entree.message}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Date de sortie
              </label>
              <input
                type="date"
                {...register('date_sortie')}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </fieldset>

        {/* Error */}
        {createEmployee.isError && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {(createEmployee.error as Error).message || "Erreur lors de la creation"}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/employees"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={createEmployee.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {createEmployee.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}
