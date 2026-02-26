'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  User,
  HardHat,
  GraduationCap,
  BookOpen,
  Briefcase,
  Building2,
  Mail,
  Phone,
  Calendar,
  FileText,
  Edit,
  UserX,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEmployee, useUpdateEmployee } from '@/hooks/useEmployee';
import { CONTRAT_TYPE_LABELS } from '@conform-plus/shared';
import type { ContratType } from '@conform-plus/shared';
import { useState } from 'react';

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: employee, isLoading } = useEmployee(id);
  const updateEmployee = useUpdateEmployee();
  const [activeTab, setActiveTab] = useState<'epi' | 'formations' | 'registres'>('epi');

  if (isLoading || !employee) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  function handleDeactivate() {
    updateEmployee.mutate(
      { id, is_active: false, date_sortie: new Date().toISOString().split('T')[0] },
      { onSuccess: () => router.push('/employees') },
    );
  }

  const epiAttributions = employee.epi_attributions || [];
  const registreEntries = employee.registre_entries || [];
  const formationEntries = registreEntries.filter(
    (e: any) => e.registres?.type === 'formations' || e.registres?.type === 'habilitations',
  );
  const otherEntries = registreEntries.filter(
    (e: any) => e.registres?.type !== 'formations' && e.registres?.type !== 'habilitations',
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/employees"
            className="rounded-md border p-2 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-display text-2xl italic text-foreground">
              {employee.nom} {employee.prenom}
            </h1>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-bold',
                  employee.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500',
                )}
              >
                {employee.is_active ? 'Actif' : 'Inactif'}
              </span>
              <span>{CONTRAT_TYPE_LABELS[employee.type_contrat as ContratType]}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {employee.is_active && (
            <button
              onClick={handleDeactivate}
              disabled={updateEmployee.isPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <UserX className="h-3.5 w-3.5" />
              Desactiver
            </button>
          )}
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground/60" />
            <div>
              <p className="text-[10px] text-muted-foreground">Poste</p>
              <p className="font-medium">{employee.poste || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground/60" />
            <div>
              <p className="text-[10px] text-muted-foreground">Site</p>
              <p className="font-medium">{(employee as any).sites?.name || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground/60" />
            <div>
              <p className="text-[10px] text-muted-foreground">Date d&apos;entree</p>
              <p className="font-medium">
                {new Date(employee.date_entree).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          {employee.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground/60" />
              <div>
                <p className="text-[10px] text-muted-foreground">Email</p>
                <p className="font-medium">{employee.email}</p>
              </div>
            </div>
          )}
          {employee.telephone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground/60" />
              <div>
                <p className="text-[10px] text-muted-foreground">Telephone</p>
                <p className="font-medium">{employee.telephone}</p>
              </div>
            </div>
          )}
          {employee.departement && (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground/60" />
              <div>
                <p className="text-[10px] text-muted-foreground">Departement</p>
                <p className="font-medium">{employee.departement}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-md border bg-card p-0.5">
        {[
          { key: 'epi' as const, label: 'EPI attribues', icon: HardHat, count: epiAttributions.length },
          { key: 'formations' as const, label: 'Formations / Habilitations', icon: GraduationCap, count: formationEntries.length },
          { key: 'registres' as const, label: 'Registres', icon: BookOpen, count: otherEntries.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-1.5 rounded px-3 py-2 text-xs font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[9px] font-bold',
                activeTab === tab.key
                  ? 'bg-white/20'
                  : 'bg-muted',
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content: EPI */}
      {activeTab === 'epi' && (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          {epiAttributions.length === 0 ? (
            <div className="p-8 text-center">
              <HardHat className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">Aucun EPI attribue</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">EPI</th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categorie</th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date attribution</th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Retour</th>
                </tr>
              </thead>
              <tbody>
                {epiAttributions.map((attr: any) => (
                  <tr key={attr.id} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium">
                      {attr.epi_items?.reference || '—'}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {attr.epi_items?.epi_categories?.name || '—'}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {new Date(attr.date_attribution).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-2">
                      {attr.date_retour ? (
                        new Date(attr.date_retour).toLocaleDateString('fr-FR')
                      ) : (
                        <span className="text-green-600 text-xs font-medium">En cours</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab content: Formations */}
      {activeTab === 'formations' && (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          {formationEntries.length === 0 ? (
            <div className="p-8 text-center">
              <GraduationCap className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">Aucune formation/habilitation enregistree</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Intitule</th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expiration</th>
                </tr>
              </thead>
              <tbody>
                {formationEntries.map((entry: any) => {
                  const d = entry.data || {};
                  return (
                    <tr key={entry.id} className="border-b last:border-0">
                      <td className="px-4 py-2">
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700">
                          {entry.registres?.type === 'habilitations' ? 'Habilitation' : 'Formation'}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-medium">
                        {d.intitule || d.type_habilitation || '—'}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {d.date_fin || d.date_obtention
                          ? new Date(d.date_fin || d.date_obtention).toLocaleDateString('fr-FR')
                          : '—'}
                      </td>
                      <td className="px-4 py-2">
                        {entry.expires_at ? (
                          <span
                            className={cn(
                              'text-xs font-medium',
                              new Date(entry.expires_at) < new Date()
                                ? 'text-red-600'
                                : 'text-muted-foreground',
                            )}
                          >
                            {new Date(entry.expires_at).toLocaleDateString('fr-FR')}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab content: Registres */}
      {activeTab === 'registres' && (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          {otherEntries.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">Aucune entree registre liee</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registre</th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expiration</th>
                </tr>
              </thead>
              <tbody>
                {otherEntries.map((entry: any) => (
                  <tr key={entry.id} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium capitalize">
                      {entry.registres?.type || '—'}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-2">
                      {entry.expires_at
                        ? new Date(entry.expires_at).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
