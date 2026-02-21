'use client';

import { use } from 'react';
import Link from 'next/link';
import { Loader2, HardHat, Printer, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEpiItem } from '@/hooks/useEpi';
import { EPI_ETAT_LABELS, EPI_STATUT_LABELS, EPI_CONTROLE_RESULTAT_LABELS } from '@conform-plus/shared';

export default function EpiAttestationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: item, isLoading } = useEpiItem(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="py-12 text-center">
        <HardHat className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Equipement introuvable</h3>
        <Link href="/epi/inventaire" className="mt-2 text-sm text-primary hover:underline">
          Retour a l&apos;inventaire
        </Link>
      </div>
    );
  }

  const category = item.category;
  const attributions = item.attributions || [];
  const controles = item.controles || [];
  const now = new Date().toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Determine conformity
  const lastControle = controles.length > 0
    ? [...controles].sort((a, b) => new Date(b.date_controle).getTime() - new Date(a.date_controle).getTime())[0]
    : null;
  const isConforme = !lastControle || lastControle.resultat === 'conforme';
  const isExpired = item.date_expiration && new Date(item.date_expiration) < new Date();

  return (
    <div className="space-y-6">
      {/* Screen-only controls */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href={`/epi/inventaire/${id}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Attestation de conformite</h1>
            <p className="text-xs text-muted-foreground">
              {item.reference || `EPI ${item.id.slice(0, 8)}`}
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
        {/* Title */}
        <div className="text-center mb-8 border-b-2 border-gray-900 pb-6">
          <h2 className="text-2xl font-bold uppercase tracking-wider">
            Attestation de Conformite EPI
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Equipement de Protection Individuelle
          </p>
          {category?.norme && (
            <p className="text-xs font-mono text-muted-foreground mt-1">
              Norme : {category.norme}
            </p>
          )}
        </div>

        {/* Equipment details */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-700">
            Identification de l&apos;equipement
          </h3>
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr>
                <td className="border px-3 py-2 font-semibold bg-gray-50 w-1/3">Reference</td>
                <td className="border px-3 py-2">{item.reference || '-'}</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-semibold bg-gray-50">Categorie</td>
                <td className="border px-3 py-2">{category?.name || '-'}</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-semibold bg-gray-50">Norme</td>
                <td className="border px-3 py-2 font-mono">{category?.norme || '-'}</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-semibold bg-gray-50">Taille</td>
                <td className="border px-3 py-2">{item.taille || '-'}</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-semibold bg-gray-50">Etat</td>
                <td className="border px-3 py-2">{EPI_ETAT_LABELS[item.etat] || item.etat}</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-semibold bg-gray-50">Statut</td>
                <td className="border px-3 py-2">{EPI_STATUT_LABELS[item.statut] || item.statut}</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-semibold bg-gray-50">Date d&apos;achat</td>
                <td className="border px-3 py-2">
                  {item.date_achat ? new Date(item.date_achat).toLocaleDateString('fr-FR') : '-'}
                </td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-semibold bg-gray-50">Date de mise en service</td>
                <td className="border px-3 py-2">
                  {item.date_mise_en_service ? new Date(item.date_mise_en_service).toLocaleDateString('fr-FR') : '-'}
                </td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-semibold bg-gray-50">Date d&apos;expiration</td>
                <td className={cn('border px-3 py-2', isExpired && 'text-red-600 font-semibold')}>
                  {item.date_expiration ? new Date(item.date_expiration).toLocaleDateString('fr-FR') : '-'}
                  {isExpired && ' (EXPIRE)'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Attributions history */}
        {attributions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-700">
              Historique des attributions
            </h3>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="border px-2 py-1.5 text-left font-semibold bg-gray-50">Salarie</th>
                  <th className="border px-2 py-1.5 text-left font-semibold bg-gray-50">Poste</th>
                  <th className="border px-2 py-1.5 text-left font-semibold bg-gray-50">Date attribution</th>
                  <th className="border px-2 py-1.5 text-left font-semibold bg-gray-50">Date retour</th>
                  <th className="border px-2 py-1.5 text-left font-semibold bg-gray-50">Attribue par</th>
                  <th className="border px-2 py-1.5 text-left font-semibold bg-gray-50">Signature</th>
                </tr>
              </thead>
              <tbody>
                {attributions.map((attr) => (
                  <tr key={attr.id}>
                    <td className="border px-2 py-1.5">{attr.salarie_nom}</td>
                    <td className="border px-2 py-1.5">{attr.salarie_poste || '-'}</td>
                    <td className="border px-2 py-1.5">
                      {new Date(attr.date_attribution).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="border px-2 py-1.5">
                      {attr.date_retour
                        ? new Date(attr.date_retour).toLocaleDateString('fr-FR')
                        : 'En cours'}
                    </td>
                    <td className="border px-2 py-1.5">{attr.attribue_par}</td>
                    <td className="border px-2 py-1.5">
                      {attr.signature_salarie ? 'Oui' : 'Non'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Controls history */}
        {controles.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-700">
              Historique des controles
            </h3>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="border px-2 py-1.5 text-left font-semibold bg-gray-50">Date</th>
                  <th className="border px-2 py-1.5 text-left font-semibold bg-gray-50">Controleur</th>
                  <th className="border px-2 py-1.5 text-left font-semibold bg-gray-50">Resultat</th>
                  <th className="border px-2 py-1.5 text-left font-semibold bg-gray-50">Observations</th>
                </tr>
              </thead>
              <tbody>
                {controles.map((ctrl) => (
                  <tr key={ctrl.id}>
                    <td className="border px-2 py-1.5">
                      {new Date(ctrl.date_controle).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="border px-2 py-1.5">{ctrl.controleur}</td>
                    <td
                      className={cn(
                        'border px-2 py-1.5 font-medium',
                        ctrl.resultat === 'conforme' && 'text-green-700',
                        ctrl.resultat === 'non_conforme' && 'text-red-700',
                        ctrl.resultat === 'a_surveiller' && 'text-orange-700',
                      )}
                    >
                      {EPI_CONTROLE_RESULTAT_LABELS[ctrl.resultat] || ctrl.resultat}
                    </td>
                    <td className="border px-2 py-1.5">{ctrl.observations || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Conformity statement */}
        <div className="mb-8 p-4 border-2 rounded">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-2 text-gray-700">
            Declaration de conformite
          </h3>
          <p className="text-sm leading-relaxed">
            {isConforme && !isExpired ? (
              <>
                L&apos;equipement de protection individuelle identifie ci-dessus est
                declare <strong className="text-green-700">CONFORME</strong> aux
                exigences reglementaires et a la norme {category?.norme || 'applicable'}.
                Il est en etat de fonctionnement et peut etre utilise en toute securite
                dans les conditions prevues par le fabricant.
              </>
            ) : (
              <>
                L&apos;equipement de protection individuelle identifie ci-dessus est
                declare <strong className="text-red-700">NON CONFORME</strong>.
                {isExpired && ' La date de peremption est depassee.'}
                {lastControle?.resultat === 'non_conforme' && ' Le dernier controle a revele une non-conformite.'}
                {' '}Cet equipement ne doit pas etre utilise et doit etre remplace.
              </>
            )}
          </p>
        </div>

        {/* Signature zone */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="border rounded p-4">
            <p className="text-xs font-semibold text-gray-700 mb-1">Responsable securite</p>
            <p className="text-[10px] text-muted-foreground mb-8">Nom, date et signature</p>
            <div className="border-b border-dashed" />
          </div>
          <div className="border rounded p-4">
            <p className="text-xs font-semibold text-gray-700 mb-1">Cachet de l&apos;entreprise</p>
            <p className="text-[10px] text-muted-foreground mb-8">&nbsp;</p>
            <div className="border-b border-dashed" />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t text-center text-[10px] text-muted-foreground">
          <p>
            Document genere par Conform+ le {now}
          </p>
          <p className="mt-1">
            Conformement aux articles R4321-1 a R4323-106 du Code du Travail relatifs aux equipements de protection individuelle.
            Ce document constitue une attestation de conformite electronique.
            L&apos;original est conserve dans le systeme Conform+ avec horodatage et audit trail complet.
          </p>
        </div>
      </div>
    </div>
  );
}
