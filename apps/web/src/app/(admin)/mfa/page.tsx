'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, Smartphone, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminMFAPage() {
    const [code, setCode] = useState('');
    const [factorId, setFactorId] = useState<string | null>(null);
    const [challengeId, setChallengeId] = useState<string | null>(null);
    const [step, setStep] = useState<'init' | 'enroll' | 'verify'>('init');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function initMFA() {
        setIsLoading(true);
        setError(null);
        const supabase = createClient();

        // Check existing factors
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totpFactor = factors?.totp?.find((f) => f.status === 'verified');

        if (totpFactor) {
            // Already enrolled — just challenge
            const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
            if (cErr) { setError(cErr.message); setIsLoading(false); return; }
            setFactorId(totpFactor.id);
            setChallengeId(challenge.id);
            setStep('verify');
        } else {
            // Enroll new TOTP factor
            const { data: enroll, error: eErr } = await supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'Conform+', friendlyName: 'Conform+ Admin' });
            if (eErr) { setError(eErr.message); setIsLoading(false); return; }
            setFactorId(enroll.id);
            setQrCode(enroll.totp.qr_code);
            setSecret(enroll.totp.secret);
            setStep('enroll');
        }
        setIsLoading(false);
    }

    async function enrollAndVerify() {
        if (!factorId) return;
        setIsLoading(true);
        setError(null);
        const supabase = createClient();

        const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
        if (cErr) { setError(cErr.message); setIsLoading(false); return; }
        setChallengeId(challenge.id);
        await verifyCode(factorId, challenge.id);
    }

    async function verifyCode(fId = factorId!, cId = challengeId!) {
        setIsLoading(true);
        setError(null);
        const supabase = createClient();

        const { error: vErr } = await supabase.auth.mfa.verify({ factorId: fId, challengeId: cId, code });
        if (vErr) { setError('Code invalide. Vérifiez votre application d\'authentification.'); setIsLoading(false); return; }

        router.replace('/admin');
        router.refresh();
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#161b22] p-8">
                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/15">
                    <ShieldCheck className="h-5 w-5 text-red-400" />
                </div>

                <h1 className="mt-5 text-lg font-bold text-white">Double authentification requise</h1>
                <p className="mt-2 text-sm text-white/40">
                    L&apos;accès au back-office Conform+ nécessite une authentification à deux facteurs.
                </p>

                {step === 'init' && (
                    <button
                        onClick={initMFA}
                        disabled={isLoading}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        <Smartphone className="h-4 w-4" />
                        {isLoading ? 'Chargement...' : 'Configurer la 2FA'}
                    </button>
                )}

                {step === 'enroll' && qrCode && (
                    <div className="mt-6 space-y-5">
                        <div>
                            <p className="mb-3 text-xs text-white/50">Scannez ce QR code avec votre application (Authy, Google Authenticator…)</p>
                            <div className="flex justify-center rounded-lg bg-white p-4">
                                <img src={qrCode} alt="QR code 2FA" className="h-36 w-36" />
                            </div>
                            {secret && (
                                <p className="mt-2 text-center font-mono text-[10px] text-white/30">{secret}</p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs text-white/50">Code de vérification</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="w-full rounded-lg border border-white/10 bg-white/6 px-4 py-2.5 text-center font-mono text-xl tracking-[0.4em] text-white outline-none placeholder-white/20 focus:border-white/20"
                            />
                        </div>
                        <button
                            onClick={enrollAndVerify}
                            disabled={isLoading || code.length < 6}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            {isLoading ? 'Vérification...' : 'Activer & continuer'} <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {step === 'verify' && (
                    <div className="mt-6 space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs text-white/50">Code dans votre application 2FA</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="w-full rounded-lg border border-white/10 bg-white/6 px-4 py-2.5 text-center font-mono text-xl tracking-[0.4em] text-white outline-none placeholder-white/20 focus:border-white/20"
                            />
                        </div>
                        <button
                            onClick={() => verifyCode()}
                            disabled={isLoading || code.length < 6}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            {isLoading ? 'Vérification...' : 'Accéder au back-office'} <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {error && (
                    <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}
