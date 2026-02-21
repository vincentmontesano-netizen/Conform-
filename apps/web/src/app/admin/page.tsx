'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Building2,
    Users,
    TrendingUp,
    ArrowUpRight,
    Layers,
} from 'lucide-react';

interface Metrics {
    total: number;
    byPlan: { basic: number; pro: number; premium: number; enterprise: number };
    mrr: number;
}

interface RecentCompany {
    id: string;
    name: string;
    created_at: string;
    subscriptions: { plan: string; status: string }[];
}

const planColors: Record<string, string> = {
    basic: 'bg-zinc-700 text-zinc-200',
    pro: 'bg-blue-500/20 text-blue-300',
    premium: 'bg-purple-500/20 text-purple-300',
    enterprise: 'bg-amber-500/20 text-amber-300',
};

export default function AdminDashboardPage() {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [recent, setRecent] = useState<RecentCompany[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const supabase = createClient();

            // Fetch subscriptions pour les métriques
            const { data: subs } = await supabase
                .from('subscriptions')
                .select('plan, status');

            const pricing: Record<string, number> = { basic: 0, pro: 49, premium: 99, enterprise: 299 };
            const byPlan = { basic: 0, pro: 0, premium: 0, enterprise: 0 };
            let mrr = 0;

            for (const s of subs ?? []) {
                if (s.plan in byPlan) byPlan[s.plan as keyof typeof byPlan]++;
                if (s.status === 'active') mrr += pricing[s.plan] ?? 0;
            }

            setMetrics({ total: subs?.length ?? 0, byPlan, mrr });

            // Fetch recent companies
            const { data: companies } = await supabase
                .from('companies')
                .select('id, name, created_at, subscriptions(plan, status)')
                .order('created_at', { ascending: false })
                .limit(8);

            setRecent((companies as RecentCompany[]) ?? []);
            setIsLoading(false);
        }

        load();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-red-400" />
            </div>
        );
    }

    const kpis = [
        { label: 'Entreprises inscrites', value: metrics?.total ?? 0, icon: Building2, sub: 'total' },
        { label: 'Plan Pro+', value: (metrics?.byPlan.pro ?? 0) + (metrics?.byPlan.premium ?? 0) + (metrics?.byPlan.enterprise ?? 0), icon: Layers, sub: 'comptes payants' },
        { label: 'MRR estimé', value: `${metrics?.mrr ?? 0} €`, icon: TrendingUp, sub: 'actifs seulement' },
        { label: 'Comptes Basic', value: metrics?.byPlan.basic ?? 0, icon: Users, sub: 'essai ou gratuit' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="mt-1 text-sm text-white/40">Vue globale de la plateforme Conform+</p>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="rounded-xl border border-white/8 bg-white/4 p-5">
                        <div className="flex items-center gap-2 text-white/40">
                            <kpi.icon className="h-4 w-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">{kpi.label}</span>
                        </div>
                        <p className="mt-3 text-3xl font-bold text-white">{kpi.value}</p>
                        <p className="mt-1 text-xs text-white/30">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            {/* Plan distribution */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-white/8 bg-white/4 p-6">
                    <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Répartition par plan</h2>
                    <div className="mt-5 space-y-3">
                        {Object.entries(metrics?.byPlan ?? {}).map(([plan, count]) => (
                            <div key={plan} className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${planColors[plan]}`}>
                                        {plan}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-1.5 w-32 rounded-full bg-white/8">
                                        <div
                                            className="h-full rounded-full bg-white/30"
                                            style={{ width: `${metrics?.total ? (count / metrics.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="w-6 text-right text-sm font-medium text-white">{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent companies */}
                <div className="rounded-xl border border-white/8 bg-white/4 p-6">
                    <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-5">Dernières inscriptions</h2>
                    <div className="space-y-2">
                        {recent.slice(0, 6).map((company) => {
                            const plan = company.subscriptions?.[0]?.plan ?? 'basic';
                            return (
                                <div key={company.id} className="flex items-center justify-between py-1.5">
                                    <span className="text-sm text-white/80">{company.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${planColors[plan]}`}>
                                            {plan}
                                        </span>
                                        <ArrowUpRight className="h-3.5 w-3.5 text-white/20" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
