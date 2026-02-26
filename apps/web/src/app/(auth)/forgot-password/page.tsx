'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
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
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <Mail className="h-6 w-6 text-accent" />
          </div>
          <h1 className="font-display text-3xl italic text-foreground">Email envoye</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Si un compte existe pour <strong className="text-foreground">{email}</strong>,
            vous recevrez un lien de reinitialisation dans quelques instants.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Pensez a verifier vos spams.
          </p>
        </div>

        <Link
          href="/login"
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour a la connexion
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
        <h1 className="font-display text-3xl italic text-foreground">Mot de passe oublie</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Entrez votre adresse email et nous vous enverrons un lien pour reinitialiser votre mot de passe.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Adresse email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-cabinet"
            placeholder="votre@email.com"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            'Envoyer le lien de reinitialisation'
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
