'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Users,
  UserPlus,
  Search,
  Download,
  Building2,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useEmployees,
  useEmployeeStats,
  useImportEmployeesFromRup,
} from '@/hooks/useEmployee';
import { CONTRAT_TYPE_LABELS } from '@conform-plus/shared';
import type { ContratType } from '@conform-plus/shared';

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(true);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useEmployees({
    search: search || undefined,
    is_active: activeFilter,
    page,
    limit: 25,
  });
  const { data: stats } = useEmployeeStats();
  const importRup = useImportEmployeesFromRup();

  const employees = data?.employees || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 25);

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <span className="text-xs text-muted-foreground">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl italic text-foreground">
            Salaries
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestion des salaries de l&apos;entreprise — reference cross-module.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => importRup.mutate()}
            disabled={importRup.isPending}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            {importRup.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Importer depuis RUP
          </button>
          <Link
            href="/employees/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Ajouter
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total
            </p>
            <p className="mt-1 text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-green-600">
              Actifs
            </p>
            <p className="mt-1 text-2xl font-bold text-green-700">{stats.active}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Inactifs
            </p>
            <p className="mt-1 text-2xl font-bold text-muted-foreground">{stats.inactive}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Par contrat
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {Object.entries(stats.by_contrat).map(([type, count]) => (
                <span
                  key={type}
                  className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium"
                >
                  {CONTRAT_TYPE_LABELS[type as ContratType] || type}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Import success message */}
      {importRup.isSuccess && (
        <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800">
          {(importRup.data as any)?.imported > 0
            ? `${(importRup.data as any).imported} salarie(s) importe(s) depuis le RUP.`
            : (importRup.data as any)?.message || 'Import termine.'}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher (nom, prenom, poste...)"
            className="w-full rounded-md border bg-card pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex items-center gap-1 rounded-md border bg-card p-0.5">
          {[
            { label: 'Actifs', value: true },
            { label: 'Inactifs', value: false },
            { label: 'Tous', value: undefined },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => {
                setActiveFilter(opt.value);
                setPage(1);
              }}
              className={cn(
                'rounded px-3 py-1.5 text-xs font-medium transition-colors',
                activeFilter === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {employees.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Aucun salarie</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Ajoutez vos salaries ou importez-les depuis le Registre Unique du Personnel.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  Nom
                </th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  Poste
                </th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  Site
                </th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  Contrat
                </th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  Entree
                </th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/employees/${emp.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {emp.nom} {emp.prenom}
                    </Link>
                    {emp.email && (
                      <p className="text-[10px] text-muted-foreground">{emp.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-3 w-3 text-muted-foreground/50" />
                      <span className="text-muted-foreground">
                        {emp.poste || '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3 w-3 text-muted-foreground/50" />
                      <span className="text-muted-foreground">
                        {(emp as any).sites?.name || '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                      {CONTRAT_TYPE_LABELS[emp.type_contrat as ContratType] || emp.type_contrat}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {emp.date_entree
                      ? new Date(emp.date_entree).toLocaleDateString('fr-FR')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-bold',
                        emp.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500',
                      )}
                    >
                      {emp.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <span className="text-xs text-muted-foreground">
                {total} salarie(s) — page {page}/{totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                >
                  Precedent
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
