'use client';

import Link from 'next/link';
import { Loader2, AlertTriangle, HardHat, Plus, Package, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEpiCategories, useEpiStats, useEpiExpiringItems, useInitEpiCategories } from '@/hooks/useEpi';
import { EpiCategoryCard } from '@/components/epi/EpiCategoryCard';
import { EPI_CATEGORY_PRESETS } from '@conform-plus/shared';

export default function EpiPage() {
  const { data: categories, isLoading: loadingCategories } = useEpiCategories();
  const { data: stats } = useEpiStats();
  const { data: expiring } = useEpiExpiringItems(30);
  const initCategories = useInitEpiCategories();

  if (loadingCategories) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <span className="text-xs text-muted-foreground">Chargement...</span>
        </div>
      </div>
    );
  }

  const hasCategories = (categories || []).length > 0;
  const totalExpiring = expiring?.length || 0;

  // Map presets by code for icon/color lookup
  const presetByCode = new Map(EPI_CATEGORY_PRESETS.map((p) => [p.code, p]));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl italic text-foreground">
            Equipements de Protection Individuelle
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerez l&apos;inventaire, les attributions et les controles de vos EPI.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!hasCategories && (
            <button
              onClick={() => initCategories.mutate()}
              disabled={initCategories.isPending}
              className={cn('btn-accent text-xs', 'disabled:opacity-50 disabled:cursor-not-allowed')}
            >
              {initCategories.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Package className="h-3.5 w-3.5" />
              )}
              Initialiser les categories
            </button>
          )}
          <Link
            href="/epi/inventaire/new"
            className={cn(
              'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
              'hover:bg-primary/90 transition-colors',
            )}
          >
            <Plus className="h-4 w-4" />
            Nouvel EPI
          </Link>
        </div>
      </div>

      {/* Stats summary */}
      {stats && (
        <div className="stagger-in grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card-accent rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <HardHat className="h-4 w-4 text-muted-foreground/60" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                EPI en service
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight">{stats.total}</p>
          </div>
          <div
            className={cn(
              'card-accent rounded-lg border bg-card p-5 shadow-sm',
              stats.expiring_30_days > 0 && 'border-orange-200',
            )}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle
                className={cn(
                  'h-4 w-4',
                  stats.expiring_30_days > 0 ? 'text-orange-500' : 'text-muted-foreground/60',
                )}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                A renouveler
              </span>
            </div>
            <p
              className={cn(
                'mt-3 text-3xl font-bold tracking-tight',
                stats.expiring_30_days > 0 && 'text-orange-600',
              )}
            >
              {stats.expiring_30_days}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">dans les 30 jours</p>
          </div>
          <div
            className={cn(
              'card-accent rounded-lg border bg-card p-5 shadow-sm',
              stats.non_conforme > 0 && 'border-red-200',
            )}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle
                className={cn(
                  'h-4 w-4',
                  stats.non_conforme > 0 ? 'text-destructive' : 'text-muted-foreground/60',
                )}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Non conforme
              </span>
            </div>
            <p
              className={cn(
                'mt-3 text-3xl font-bold tracking-tight',
                stats.non_conforme > 0 && 'text-destructive',
              )}
            >
              {stats.non_conforme}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">a remplacer</p>
          </div>
          <div className="card-accent rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="h-4 w-4 text-muted-foreground/60" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight">{(categories || []).length}</p>
          </div>
        </div>
      )}

      {/* Expiry alert banner */}
      {totalExpiring > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-orange-300 bg-orange-50 p-4">
          <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-800">
              {totalExpiring} EPI arrive(nt) a echeance dans les 30 prochains jours
            </p>
            <p className="text-xs text-orange-700">
              Verifiez et renouvelez les equipements concernes.
            </p>
          </div>
          <Link
            href="/epi/inventaire?etat=a_remplacer"
            className="ml-auto shrink-0 rounded-md border border-orange-300 bg-white px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-50 transition-colors"
          >
            Voir les EPI
          </Link>
        </div>
      )}

      {/* Categories grid */}
      {hasCategories ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Categories d&apos;EPI</h2>
            <Link
              href="/epi/categories"
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              Gerer les categories
            </Link>
          </div>
          <div className="stagger-in grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {(categories || []).map((cat) => {
              const preset = presetByCode.get(cat.code || '');
              return (
                <EpiCategoryCard
                  key={cat.id}
                  category={cat}
                  presetIcon={preset?.icon}
                  presetColor={preset?.color}
                />
              );
            })}
          </div>
        </>
      ) : (
        <div className="rounded-lg border bg-card p-12 text-center">
          <HardHat className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Aucune categorie</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Initialisez les 10 categories predefinies avec les normes europeennes, ou creez vos propres categories.
          </p>
          <button
            onClick={() => initCategories.mutate()}
            disabled={initCategories.isPending}
            className="btn-accent mt-4 text-xs"
          >
            {initCategories.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Package className="h-3.5 w-3.5" />
            )}
            Initialiser les categories
          </button>
        </div>
      )}

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/epi/inventaire"
          className="rounded-lg border bg-card p-5 text-center shadow-sm hover:shadow-md transition-shadow"
        >
          <HardHat className="mx-auto h-6 w-6 text-primary" />
          <p className="mt-2 text-sm font-semibold">Inventaire complet</p>
          <p className="mt-1 text-xs text-muted-foreground">Voir tous les EPI</p>
        </Link>
        <Link
          href="/epi/attributions"
          className="rounded-lg border bg-card p-5 text-center shadow-sm hover:shadow-md transition-shadow"
        >
          <Package className="mx-auto h-6 w-6 text-primary" />
          <p className="mt-2 text-sm font-semibold">Attributions</p>
          <p className="mt-1 text-xs text-muted-foreground">Historique des remises</p>
        </Link>
        <Link
          href="/epi/controles"
          className="rounded-lg border bg-card p-5 text-center shadow-sm hover:shadow-md transition-shadow"
        >
          <BarChart3 className="mx-auto h-6 w-6 text-primary" />
          <p className="mt-2 text-sm font-semibold">Controles</p>
          <p className="mt-1 text-xs text-muted-foreground">Verifications periodiques</p>
        </Link>
      </div>

      {/* Legal notice */}
      <div className="rounded-lg border bg-card/50 p-4 text-center">
        <HardHat className="mx-auto h-5 w-5 text-muted-foreground/40" />
        <p className="mt-2 text-xs text-muted-foreground">
          La gestion des EPI est reglementee par les articles R4321-1 a R4323-106 du Code du Travail.
          L&apos;employeur est tenu de fournir, entretenir et controler les EPI de ses salaries.
        </p>
      </div>
    </div>
  );
}
