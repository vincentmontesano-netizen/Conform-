'use client';

import Link from 'next/link';
import { Loader2, ArrowLeft, Printer, GraduationCap, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFormationRapport } from '@/hooks/useFormation';
import { ConformiteBadge } from '@/components/formations/ConformiteBadge';
import { RapportHeader } from '@/components/formations/RapportHeader';
import { FORMATION_CATEGORY_LABELS } from '@conform-plus/shared';

export default function FormationRapportPage() {
  const { data: rapport, isLoading } = useFormationRapport();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <span className="text-xs text-muted-foreground">Generation du rapport...</span>
        </div>
      </div>
    );
  }

  if (!rapport) {
    return (
      <div className="py-12 text-center">
        <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Rapport indisponible</h3>
        <Link href="/formations" className="mt-2 text-sm text-primary hover:underline">
          Retour aux formations
        </Link>
      </div>
    );
  }

  const { stats, matrix, formation_types } = rapport;

  return (
    <div className="space-y-6">
      {/* Screen-only controls */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/formations/conformite"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Rapport d&apos;inspection</h1>
            <p className="text-xs text-muted-foreground">
              Formations & Habilitations — document imprimable
            </p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className={cn(
            'inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
            'hover:bg-primary/90 transition-colors',
          )}
        >
          <Printer className="h-4 w-4" />
          Imprimer / PDF
        </button>
      </div>

      {/* Printable content */}
      <div className="rounded-lg border bg-white p-8 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Header */}
        <RapportHeader
          companyName={rapport.company_name}
          generatedAt={rapport.generated_at}
        />

        {/* Statistiques resumees */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-700">
            Synthese
          </h3>
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr>
                <td className="border px-3 py-2 font-semibold bg-gray-50 w-1/2">Salaries suivis</td>
                <td className="border px-3 py-2">{stats.total_salaries}</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-semibold bg-gray-50">Formations a jour</td>
                <td className="border px-3 py-2 text-green-700">{stats.formations_valid}</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-semibold bg-gray-50">Formations expirant (&le; 30j)</td>
                <td className={cn('border px-3 py-2', stats.formations_expiring > 0 && 'text-orange-700 font-semibold')}>
                  {stats.formations_expiring}
                </td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-semibold bg-gray-50">Formations expirees</td>
                <td className={cn('border px-3 py-2', stats.formations_expired > 0 && 'text-red-700 font-semibold')}>
                  {stats.formations_expired}
                </td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-semibold bg-gray-50">Habilitations a jour</td>
                <td className="border px-3 py-2 text-green-700">{stats.habilitations_valid}</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-semibold bg-gray-50">Habilitations expirant (&le; 30j)</td>
                <td className={cn('border px-3 py-2', stats.habilitations_expiring > 0 && 'text-orange-700 font-semibold')}>
                  {stats.habilitations_expiring}
                </td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-semibold bg-gray-50">Habilitations expirees</td>
                <td className={cn('border px-3 py-2', stats.habilitations_expired > 0 && 'text-red-700 font-semibold')}>
                  {stats.habilitations_expired}
                </td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-semibold bg-gray-50">Obligatoires manquantes</td>
                <td className={cn('border px-3 py-2', stats.obligatoires_manquantes > 0 && 'text-red-700 font-semibold')}>
                  {stats.obligatoires_manquantes}
                </td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-semibold bg-gray-50">Score de conformite global</td>
                <td className={cn(
                  'border px-3 py-2 font-bold',
                  stats.global_score >= 80 ? 'text-green-700' : stats.global_score >= 50 ? 'text-orange-700' : 'text-red-700',
                )}>
                  {stats.global_score} / 100
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Matrice de conformite */}
        {matrix.rows.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-700">
              Matrice de conformite
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] border-collapse">
                <thead>
                  <tr>
                    <th className="border px-2 py-1 text-left font-semibold bg-gray-50">Salarie</th>
                    <th className="border px-1 py-1 text-center font-semibold bg-gray-50">Score</th>
                    {matrix.columns.map((col: any) => (
                      <th key={col.id} className="border px-1 py-1 text-center font-semibold bg-gray-50">
                        {col.code}
                        {col.is_obligatoire && <span className="text-red-500">*</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.rows.map((row) => (
                    <tr key={row.salarie_nom}>
                      <td className="border px-2 py-1 font-medium">{row.salarie_nom}</td>
                      <td className="border px-1 py-1 text-center font-bold">{row.score}%</td>
                      {row.cells.map((cell) => (
                        <td
                          key={cell.formation_type_id}
                          className={cn(
                            'border px-1 py-1 text-center font-semibold',
                            cell.status === 'valid' && 'bg-green-50 text-green-800',
                            cell.status === 'expiring' && 'bg-orange-50 text-orange-800',
                            cell.status === 'expired' && 'bg-red-50 text-red-800',
                            cell.status === 'missing' && 'bg-gray-50 text-gray-400',
                          )}
                        >
                          {cell.status === 'valid' && 'OK'}
                          {cell.status === 'expiring' && `${cell.days_remaining}j`}
                          {cell.status === 'expired' && 'EXP'}
                          {cell.status === 'missing' && '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[9px] text-muted-foreground">
              * = Formation/habilitation obligatoire | OK = A jour | EXP = Expire | — = Manquant | Nombre = jours restants
            </p>
          </div>
        )}

        {/* Table de reference des types */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-700">
            Reference des types de formation / habilitation
          </h3>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-1.5 text-left font-semibold bg-gray-50">Code</th>
                <th className="border px-2 py-1.5 text-left font-semibold bg-gray-50">Denomination</th>
                <th className="border px-2 py-1.5 text-left font-semibold bg-gray-50">Categorie</th>
                <th className="border px-2 py-1.5 text-left font-semibold bg-gray-50">Validite</th>
                <th className="border px-2 py-1.5 text-left font-semibold bg-gray-50">Norme</th>
                <th className="border px-2 py-1.5 text-left font-semibold bg-gray-50">Obligatoire</th>
              </tr>
            </thead>
            <tbody>
              {formation_types.map((ft) => (
                <tr key={ft.id}>
                  <td className="border px-2 py-1.5 font-mono font-bold">{ft.code}</td>
                  <td className="border px-2 py-1.5">{ft.name}</td>
                  <td className="border px-2 py-1.5">
                    {FORMATION_CATEGORY_LABELS[ft.category]}
                  </td>
                  <td className="border px-2 py-1.5">
                    {ft.duree_validite_mois
                      ? `${ft.duree_validite_mois} mois`
                      : 'Illimite'}
                  </td>
                  <td className="border px-2 py-1.5 font-mono text-[10px]">
                    {ft.norme || '-'}
                  </td>
                  <td className={cn(
                    'border px-2 py-1.5 font-semibold',
                    ft.is_obligatoire ? 'text-red-700' : 'text-gray-500',
                  )}>
                    {ft.is_obligatoire ? 'OUI' : 'Non'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* References legales */}
        <div className="mb-8 p-4 border-2 rounded">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-2 text-gray-700">
            References reglementaires
          </h3>
          <ul className="text-xs leading-relaxed space-y-1 text-gray-700">
            <li><strong>Art. L4141-1 a L4141-4 CT</strong> — Obligation generale de formation a la securite</li>
            <li><strong>Art. R4224-15 CT</strong> — Sauveteur Secouriste du Travail (SST)</li>
            <li><strong>Art. R4227-39 CT</strong> — Formation securite incendie et evacuation</li>
            <li><strong>Art. R4544-9 CT / NF C18-510</strong> — Habilitation electrique</li>
            <li><strong>Art. R4323-56 CT</strong> — CACES (chariots, engins, nacelles)</li>
            <li><strong>Art. R4412-94 / R4412-117 CT</strong> — Amiante sous-section 3 et 4</li>
            <li><strong>Art. R4323-89 CT</strong> — Travail en hauteur</li>
            <li><strong>Art. R4227-49 CT</strong> — ATEX (atmospheres explosives)</li>
          </ul>
        </div>

        {/* Signature zone */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="border rounded p-4">
            <p className="text-xs font-semibold text-gray-700 mb-1">L&apos;employeur</p>
            <p className="text-[10px] text-muted-foreground mb-8">Nom, date et signature</p>
            <div className="border-b border-dashed" />
          </div>
          <div className="border rounded p-4">
            <p className="text-xs font-semibold text-gray-700 mb-1">L&apos;inspecteur du travail</p>
            <p className="text-[10px] text-muted-foreground mb-8">Nom, date et signature</p>
            <div className="border-b border-dashed" />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t text-center text-[10px] text-muted-foreground">
          <p>
            Document genere par Conform+ le{' '}
            {new Date(rapport.generated_at).toLocaleString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="mt-1">
            Conformement aux articles L4141-1 a L4141-4 du Code du Travail relatifs a l&apos;obligation generale de
            formation a la securite. Ce document constitue un rapport de conformite electronique.
            L&apos;original est conserve dans le systeme Conform+ avec horodatage et audit trail complet.
          </p>
        </div>
      </div>
    </div>
  );
}
