'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArrowUp, ArrowDown, Search } from 'lucide-react';

const PLANS = ['basic', 'pro', 'premium', 'enterprise'] as const;
type Plan = typeof PLANS[number];

const planColors: Record<string, string> = {
    basic: 'bg-zinc-700 text-zinc-200',
    pro: 'bg-blue-500/20 text-blue-300',
    premium: 'bg-purple-500/20 text-purple-300',
    enterprise: 'bg-amber-500/20 text-amber-300',
};

const statusColors: Record<string, string> = {
    active: 'text-green-400',
    trialing: 'text-yellow-400',
    canceled: 'text-red-400',
    past_due: 'text-orange-400',
};

interface Company {
    id: string;
    name: string;
    created_at: string;
    subscriptions: {
        id: string;
        plan: Plan;
        status: string;
        current_period_end: string | null;
    }[];
}

export default function AdminCompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [filtered, setFiltered] = useState<Company[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    async function loadCompanies() {
        const supabase = createClient();
        const { data } = await supabase
            .from('companies')
            .select('id, name, created_at, subscriptions(id, plan, status, current_period_end)')
            .order('created_at', { ascending: false });

        setCompanies((data as Company[]) ?? []);
        setFiltered((data as Company[]) ?? []);
        setIsLoading(false);
    }

    useEffect(() => {
        loadCompanies();
    }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(
            q ? companies.filter((c) => c.name.toLowerCase().includes(q)) : companies,
        );
    }, [search, companies]);

    async function changePlan(companyId: string, subId: string, plan: Plan) {
        setUpdating(companyId);
        const supabase = createClient();
        await supabase
            .from('subscriptions')
            .update({ plan, status: 'active', updated_at: new Date().toISOString() })
            .eq('id', subId);
        await loadCompanies();
        setUpdating(null);
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-red-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Entreprises</h1>
                    <p className="mt-1 text-sm text-white/40">{companies.length} client(s) inscrit(s)</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher une entreprise..."
                    className="w-full rounded-lg border border-white/10 bg-white/6 py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-white/20"
                />
            </div>

            {/* Table */}
            <div className="rounded-xl border border-white/8 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/8 bg-white/4">
                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">Entreprise</th>
                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">Plan</th>
                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">Statut</th>
                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">Inscrit le</th>
                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/6">
                        {filtered.map((company) => {
                            const sub = company.subscriptions?.[0];
                            const isUpdating = updating === company.id;
                            return (
                                <tr key={company.id} className="bg-transparent transition-colors hover:bg-white/3">
                                    <td className="px-5 py-3.5 font-medium text-white">{company.name}</td>
                                    <td className="px-5 py-3.5">
                                        {sub ? (
                                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${planColors[sub.plan]}`}>
                                                {sub.plan}
                                            </span>
                                        ) : '—'}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`text-xs font-medium ${statusColors[sub?.status ?? ''] ?? 'text-white/40'}`}>
                                            {sub?.status ?? '—'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-white/40 text-xs">
                                        {new Date(company.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {sub && (
                                            <div className="flex items-center gap-2">
                                                <select
                                                    defaultValue={sub.plan}
                                                    disabled={isUpdating}
                                                    onChange={(e) => changePlan(company.id, sub.id, e.target.value as Plan)}
                                                    className="rounded-md border border-white/10 bg-white/8 px-2 py-1 text-xs text-white outline-none cursor-pointer disabled:opacity-50"
                                                >
                                                    {PLANS.map((p) => (
                                                        <option key={p} value={p} className="bg-[#1a1f28]">{p}</option>
                                                    ))}
                                                </select>
                                                {isUpdating && (
                                                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-red-400" />
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
