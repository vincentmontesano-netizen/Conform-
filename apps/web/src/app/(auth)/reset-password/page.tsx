'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase automatically handles the token exchange from the email link
    // via the PKCE flow. We just need to check if a session exists.
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });
    // Also check current session (user may have already been authenticated)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Redirect to dashboard after 3 seconds
    setTimeout(() => {
      router.push('/dashboard');
      router.refresh();
    }, 3000);
  }

  if (success) {
    return (
      <div className="animate-fade-in-up">
        <div className="mb-10 lg:hidden">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl italic text-primary">Conform</span>
            <span className="text-accent text-xl font-bold">+</span>
          </div>
        </div>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <h1 className="font-display text-3xl italic text-foreground">Mot de passe modifie</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Votre mot de passe a ete mis a jour avec succes.
            Vous allez etre redirige vers le tableau de bord...
          </p>
        </div>

        <Link
          href="/dashboard"
          className="btn-primary w-full flex items-center justify-center"
        >
          Aller au tableau de bord
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-10 lg:hidden">
        <div className="flex items-baseline gap-1">
          <span className="font-display text-2xl italic text-primary">Conform</span>
          <span className="text-accent text-xl font-bold">+</span>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="font-display text-3xl italic text-foreground">Nouveau mot de passe</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choisissez un nouveau mot de passe pour votre compte.
        </p>
      </div>

      {!sessionReady && (
        <div className="mb-5 rounded-md border border-yellow-500/30 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-600">
          Verification du lien en cours... Si cette page ne se met pas a jour,
          le lien a peut-etre expire.{' '}
          <Link href="/forgot-password" className="font-semibold underline">
            Demander un nouveau lien
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Nouveau mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="input-cabinet"
            placeholder="••••••••"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">Minimum 6 caracteres</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Confirmer le mot de passe
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="input-cabinet"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !sessionReady}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Mise a jour...
            </>
          ) : (
            'Mettre a jour le mot de passe'
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link href="/login" className="inline-flex items-center gap-1 font-semibold text-accent hover:text-accent/80 transition-colors">
          <ArrowLeft className="h-3 w-3" />
          Retour a la connexion
        </Link>
      </p>
    </div>
  );
}
