'use client';

import { useCompanies, useCompany, useSites } from '@/hooks/useCompany';
import { SECTORS } from '@conform-plus/shared';
import { Building2, MapPin, Users, Loader2, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { WizardTooltip } from '@/components/duerp/WizardTooltip';
import type { useDuerpWizard } from '@/hooks/useDuerpWizard';

interface StepQualificationProps {
  wizard: ReturnType<typeof useDuerpWizard>;
}

function getSectorLabel(value: string): string {
  const sector = SECTORS.find((s) => s.value === value);
  return sector?.label ?? value;
}

export function StepQualification({ wizard }: StepQualificationProps) {
  const { data: companies, isLoading: loadingCompanies } = useCompanies();
  const { data: companyDetail, isLoading: loadingCompany } = useCompany(wizard.companyId);
  const { data: sites, isLoading: loadingSites } = useSites(wizard.companyId);

  if (loadingCompanies) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <div className="py-12 text-center">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Aucune entreprise</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Creez d'abord une entreprise pour pouvoir generer un DUERP.
        </p>
        <Link
          href="/companies/new"
          className={cn(
            'mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
            'hover:bg-primary/90 transition-colors'
          )}
        >
          Creer une entreprise
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Etape 1 : Qualification</h2>
        <p className="text-sm text-muted-foreground">
          Selectionnez l'entreprise et le site concernes par ce Document Unique.
        </p>
      </div>

      {/* DUERP obligatoire banner */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-xs text-amber-800">
          <span className="font-semibold">Art. R4121-1 :</span> Le Document Unique est obligatoire
          pour tout employeur, meme sans salarie. Les categories de risques seront automatiquement
          adaptees au secteur d&apos;activite selectionne.
        </p>
      </div>

      {/* Company Select */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="company-select" className="text-sm font-medium">
            Entreprise <span className="text-destructive">*</span>
          </label>
          <WizardTooltip
            title="Choix de l'entreprise"
            content="Selectionnez l'entreprise pour laquelle vous souhaitez creer le DUERP. Le secteur d'activite determinera les categories de risques proposees."
          />
        </div>
        <select
          id="company-select"
          value={wizard.companyId}
          onChange={(e) => wizard.setCompany(e.target.value)}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
        >
          <option value="">Selectionnez une entreprise</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name} ({company.siret})
            </option>
          ))}
        </select>
      </div>

      {/* Site Select */}
      {wizard.companyId && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor="site-select" className="text-sm font-medium">
              Site (optionnel)
            </label>
            <WizardTooltip
              title="Site specifique"
              content="Si l'entreprise possede plusieurs sites, vous pouvez cibler le DUERP sur un site precis. Sinon, il couvrira l'ensemble de l'entreprise."
            />
          </div>
          {loadingSites ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Chargement des sites...</span>
            </div>
          ) : (
            <select
              id="site-select"
              value={wizard.siteId}
              onChange={(e) => wizard.setSite(e.target.value)}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              )}
            >
              <option value="">Tous les sites</option>
              {sites?.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} {site.city ? `(${site.city})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Company Summary Card */}
      {wizard.companyId && companyDetail && !loadingCompany && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Recapitulatif de l'entreprise
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{companyDetail.name}</p>
                <p className="text-xs text-muted-foreground">SIRET : {companyDetail.siret}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{companyDetail.employee_count} salarie(s)</p>
                <p className="text-xs text-muted-foreground">
                  Secteur : {getSectorLabel(companyDetail.sector)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {companyDetail.has_physical_site ? 'Site physique' : 'Pas de site physique'}
                </p>
                {companyDetail.sites && companyDetail.sites.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {companyDetail.sites.length} site(s) enregistre(s)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Selected site info */}
          {wizard.siteId && sites && (
            (() => {
              const selectedSite = sites.find((s) => s.id === wizard.siteId);
              if (!selectedSite) return null;
              return (
                <div className="mt-3 rounded-md border bg-background p-3">
                  <p className="text-sm font-medium">Site selectionne : {selectedSite.name}</p>
                  {selectedSite.address && (
                    <p className="text-xs text-muted-foreground">
                      {selectedSite.address}
                      {selectedSite.zip_code ? `, ${selectedSite.zip_code}` : ''}
                      {selectedSite.city ? ` ${selectedSite.city}` : ''}
                    </p>
                  )}
                </div>
              );
            })()
          )}
        </div>
      )}

      {!wizard.companyId && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-800">Information</p>
            <p className="text-sm text-blue-700">
              Selectionnez une entreprise pour continuer. Les categories de risques seront
              automatiquement adaptees au secteur d'activite de l'entreprise.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
