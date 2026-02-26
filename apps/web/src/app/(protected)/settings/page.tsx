'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User, Shield, Loader2, Lock, Bot, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  rh: 'Responsable RH',
  manager: 'Manager',
  inspecteur: 'Inspecteur',
};

const TABS = [
  { id: 'profil' as const, label: 'Profil', icon: User },
  { id: 'parametres' as const, label: 'Paramètres', icon: Settings2 },
  { id: 'securite' as const, label: 'Sécurité', icon: Lock },
] as const;

type TabId = (typeof TABS)[number]['id'];

function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get<UserProfile>('/auth/profile'),
  });
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profil');
  const { data: profile, isLoading, error } = useProfile();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-sm text-muted-foreground">
          Gerez votre profil, l&apos;assistant et les parametres de votre compte.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex gap-1" aria-label="Onglets des parametres">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="rounded-lg border bg-card shadow-sm">
        {/* Profil */}
        {activeTab === 'profil' && (
          <div className="p-6">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5" />
              Profil utilisateur
            </h2>
            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <p className="text-sm text-destructive">
                  Erreur lors du chargement du profil : {(error as Error).message}
                </p>
              </div>
            )}
            {!isLoading && !error && profile && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
                    <div className="flex h-10 items-center rounded-md border border-input bg-muted/30 px-3 text-sm">
                      {profile.full_name || 'Non renseigne'}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Adresse email</label>
                    <div className="flex h-10 items-center rounded-md border border-input bg-muted/30 px-3 text-sm">
                      {profile.email}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                    <div className="flex h-10 items-center rounded-md border border-input bg-muted/30 px-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                          profile.role === 'admin'
                            ? 'border-purple-300 bg-purple-100 text-purple-700'
                            : 'border-blue-300 bg-blue-100 text-blue-700',
                        )}
                      >
                        <Shield className="h-3 w-3" />
                        {ROLE_LABELS[profile.role] ?? profile.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!isLoading && !error && !profile && (
              <p className="py-4 text-sm text-muted-foreground">Impossible de charger le profil.</p>
            )}
          </div>
        )}

        {/* Paramètres - Portal / Assistant */}
        {activeTab === 'parametres' && (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <Bot className="h-5 w-5" />
                Assistant juridique (Portal)
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                L&apos;assistant IA Conform+ vous aide a repondre a vos questions reglementaires.
                Il utilise une base documentaire validee et Mistral AI.
              </p>
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Informations du portal
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Propulse par Mistral AI</li>
                  <li>• Base documentaire : Active et validee</li>
                  <li>• Usage consultatif — verifiez toujours avec un juriste</li>
                  <li>• Cliquez sur l&apos;icône en bas a droite pour ouvrir ou fermer le chat</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Sécurité - 2FA */}
        {activeTab === 'securite' && (
          <div className="p-6">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold">
              <Lock className="h-5 w-5" />
              Authentification a deux facteurs (2FA)
            </h2>
            <div className="py-8 text-center">
              <Lock className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <h3 className="mt-3 font-medium">Bientot disponible</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                La configuration de l&apos;authentification a deux facteurs sera disponible
                prochainement pour renforcer la securite de votre compte.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
