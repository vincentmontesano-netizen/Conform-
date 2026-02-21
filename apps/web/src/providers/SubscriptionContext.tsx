'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type SubscriptionPlan = 'basic' | 'pro' | 'premium' | 'enterprise';
export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'past_due';

export interface Subscription {
    id: string;
    company_id: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    trial_ends_at: string | null;
    current_period_end: string | null;
}

interface SubscriptionContextValue {
    subscription: Subscription | null;
    plan: SubscriptionPlan;
    isLoading: boolean;
    isPro: boolean;
    isPremium: boolean;
    isEnterprise: boolean;
    canAccess: (feature: 'epi' | 'formations') => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue>({
    subscription: null,
    plan: 'basic',
    isLoading: true,
    isPro: false,
    isPremium: false,
    isEnterprise: false,
    canAccess: () => false,
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchSubscription() {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Récupère le company_id du profil de l'utilisateur
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('company_id')
                    .eq('user_id', user.id)
                    .single();

                if (!profile?.company_id) return;

                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('company_id', profile.company_id)
                    .single();

                if (sub) setSubscription(sub as Subscription);
            } catch (err) {
                console.error('Failed to fetch subscription:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchSubscription();
    }, []);

    const plan: SubscriptionPlan = subscription?.plan ?? 'basic';
    const isPro = plan === 'pro' || plan === 'premium' || plan === 'enterprise';
    const isPremium = plan === 'premium' || plan === 'enterprise';
    const isEnterprise = plan === 'enterprise';

    // Basic: DUERP + Registres seulement
    // Pro+: tout
    function canAccess(feature: 'epi' | 'formations'): boolean {
        if (feature === 'epi' || feature === 'formations') return isPro;
        return true;
    }

    return (
        <SubscriptionContext.Provider value={{ subscription, plan, isLoading, isPro, isPremium, isEnterprise, canAccess }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    return useContext(SubscriptionContext);
}
