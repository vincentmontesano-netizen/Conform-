'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User, Shield, Loader2, Lock } from 'lucide-react';
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

function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get<UserProfile>('/auth/profile'),
  });
}

export default function SettingsPage() {
  const { data: profile, isLoading, error } = useProfile();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Parametres</h1>
        <p className="text-sm text-muted-foreground">
          Gerez votre profil et les parametres de votre compte.
        </p>
      </div>

      {/* Profile Section */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <User className="h-5 w-5" />
            Profil
          </h2>
        </div>
        <div className="px-6 py-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
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
                  <label className="text-sm font-medium text-muted-foreground">
                    Nom complet
                  </label>
                  <div
                    className={cn(
                      'flex h-10 items-center rounded-md border border-input bg-muted/30 px-3 text-sm'
                    )}
                  >
                    {profile.full_name || 'Non renseigne'}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">
                    Adresse email
                  </label>
                  <div
                    className={cn(
                      'flex h-10 items-center rounded-md border border-input bg-muted/30 px-3 text-sm'
                    )}
                  >
                    {profile.email}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">
                    Role
                  </label>
                  <div
                    className={cn(
                      'flex h-10 items-center rounded-md border border-input bg-muted/30 px-3 text-sm'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                        profile.role === 'admin'
                          ? 'border-purple-300 bg-purple-100 text-purple-700'
                          : 'border-blue-300 bg-blue-100 text-blue-700'
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
            <p className="py-4 text-sm text-muted-foreground">
              Impossible de charger les informations du profil.
            </p>
          )}
        </div>
      </div>

      {/* 2FA Section */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <Lock className="h-5 w-5" />
            Authentification a deux facteurs (2FA)
          </h2>
        </div>
        <div className="px-6 py-8 text-center">
          <Lock className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <h3 className="mt-3 font-medium">Bientot disponible</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            La configuration de l'authentification a deux facteurs sera disponible prochainement
            pour renforcer la securite de votre compte.
          </p>
        </div>
      </div>
    </div>
  );
}
