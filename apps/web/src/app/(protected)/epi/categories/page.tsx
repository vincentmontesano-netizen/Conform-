'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Package,
  ArrowLeft,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useEpiCategories,
  useCreateEpiCategory,
  useUpdateEpiCategory,
  useDeleteEpiCategory,
  useInitEpiCategories,
} from '@/hooks/useEpi';
import { EpiCategoryForm } from '@/components/epi/EpiCategoryForm';

export default function EpiCategoriesPage() {
  const { data: categories, isLoading } = useEpiCategories();
  const createCategory = useCreateEpiCategory();
  const updateCategory = useUpdateEpiCategory();
  const deleteCategory = useDeleteEpiCategory();
  const initCategories = useInitEpiCategories();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  const hasCategories = (categories || []).length > 0;
  const editingCategory = editingId ? categories?.find((c) => c.id === editingId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/epi" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">Categories d&apos;EPI</h1>
          </div>
          <p className="text-xs text-muted-foreground ml-8">
            Gerez les categories d&apos;equipements de protection individuelle.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!hasCategories && (
            <button
              onClick={() => initCategories.mutate()}
              disabled={initCategories.isPending}
              className={cn('btn-accent text-xs', 'disabled:opacity-50')}
            >
              {initCategories.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Package className="h-3.5 w-3.5" />
              )}
              Initialiser
            </button>
          )}
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
            }}
            className={cn(
              'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
              'hover:bg-primary/90 transition-colors',
            )}
          >
            <Plus className="h-4 w-4" />
            Nouvelle categorie
          </button>
        </div>
      </div>

      {/* Create / Edit form */}
      {(showForm || editingId) && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">
              {editingId ? 'Modifier la categorie' : 'Nouvelle categorie'}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <EpiCategoryForm
            initialData={
              editingCategory
                ? {
                    name: editingCategory.name,
                    code: editingCategory.code || '',
                    description: editingCategory.description || '',
                    norme: editingCategory.norme || '',
                    duree_vie_mois: editingCategory.duree_vie_mois || '',
                    controle_periodique_mois: editingCategory.controle_periodique_mois || '',
                  }
                : undefined
            }
            isSubmitting={createCategory.isPending || updateCategory.isPending}
            submitLabel={editingId ? 'Mettre a jour' : 'Creer'}
            onCancel={() => {
              setShowForm(false);
              setEditingId(null);
            }}
            onSubmit={(data) => {
              if (editingId) {
                updateCategory.mutate(
                  { id: editingId, ...(data as Record<string, string | number | boolean>) },
                  {
                    onSuccess: () => setEditingId(null),
                  },
                );
              } else {
                createCategory.mutate(data as { name: string }, {
                  onSuccess: () => setShowForm(false),
                });
              }
            }}
          />
        </div>
      )}

      {/* Categories table */}
      {hasCategories ? (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nom</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Code</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Norme</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Duree vie</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Controle</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Items</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(categories || []).map((cat) => (
                  <tr key={cat.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{cat.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{cat.code || '-'}</td>
                    <td className="px-4 py-3 text-xs">{cat.norme || '-'}</td>
                    <td className="px-4 py-3 text-xs">
                      {cat.duree_vie_mois ? `${cat.duree_vie_mois} mois` : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {cat.controle_periodique_mois ? `${cat.controle_periodique_mois} mois` : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs">{cat.items_count}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingId(cat.id);
                            setShowForm(false);
                          }}
                          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Supprimer cette categorie ?')) {
                              deleteCategory.mutate(cat.id);
                            }
                          }}
                          className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Aucune categorie</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Initialisez les categories predefinies ou creez-en une manuellement.
          </p>
        </div>
      )}
    </div>
  );
}
