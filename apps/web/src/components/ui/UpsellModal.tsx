'use client';

import { ArrowRight, Lock, X, Zap } from 'lucide-react';
import Link from 'next/link';

interface UpsellModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName: string;
}

export function UpsellModal({ isOpen, onClose, featureName }: UpsellModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                    <Lock className="h-6 w-6 text-accent" />
                </div>

                {/* Content */}
                <h2 className="mt-5 font-display text-xl italic text-foreground">
                    Débloquez {featureName}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    La gestion de la sécurité terrain est réservée au plan <strong className="text-foreground">Pro</strong>.
                    Passez au Pro pour débloquer la gestion des EPI, le suivi des formations et des habilitations.
                </p>

                {/* Pro features highlight */}
                <ul className="mt-5 space-y-2">
                    {['Gestion EPI & dotations employés', 'Suivi formations & habilitations', 'Alertes péremption automatiques'].map((feat) => (
                        <li key={feat} className="flex items-center gap-2.5 text-sm text-foreground">
                            <Zap className="h-3.5 w-3.5 shrink-0 text-accent" />
                            {feat}
                        </li>
                    ))}
                </ul>

                {/* CTAs */}
                <div className="mt-7 flex flex-col gap-3">
                    <Link
                        href="/#pricing"
                        className="btn-accent w-full justify-center"
                        onClick={onClose}
                    >
                        Passer au plan Pro <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={onClose}
                        className="btn-ghost w-full justify-center text-xs text-muted-foreground"
                    >
                        Peut-être plus tard
                    </button>
                </div>
            </div>
        </div>
    );
}
