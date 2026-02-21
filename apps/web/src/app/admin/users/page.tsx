'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, RotateCcw } from 'lucide-react';

const ROLES = ['admin', 'rh', 'manager', 'inspecteur'] as const;
type Role = typeof ROLES[number];

const roleColors: Record<string, string> = {
    admin: 'bg-red-500/20 text-red-300',
    rh: 'bg-blue-500/20 text-blue-300',
    manager: 'bg-green-500/20 text-green-300',
    inspecteur: 'bg-yellow-500/20 text-yellow-300',
    super_admin: 'bg-purple-500/20 text-purple-300',
};

interface Profile {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    role: string;
    company_id: string | null;
    companies: { name: string } | null;
}

export default function AdminUsersPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [filtered, setFiltered] = useState<Profile[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [resetSuccess, setResetSuccess] = useState<string | null>(null);

    async function loadProfiles() {
        const supabase = createClient();
        const { data } = await supabase
            .from('profiles')
            .select('id, user_id, first_name, last_name, role, company_id, companies(name)')
            .order('created_at', { ascending: false });

        setProfiles((data as Profile[]) ?? []);
        setFiltered((data as Profile[]) ?? []);
        setIsLoading(false);
    }

    useEffect(() => {
        loadProfiles();
    }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(
            q
                ? profiles.filter(
                    (p) =>
                        `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
                        (p.companies?.name ?? '').toLowerCase().includes(q),
                )
                : profiles,
        );
    }, [search, profiles]);

    async function changeRole(profileId: string, role: Role) {
        setUpdatingId(profileId);
        const supabase = createClient();
        await supabase.from('profiles').update({ role }).eq('id', profileId);
        await loadProfiles();
        setUpdatingId(null);
    }

    async function resetPassword(userId: string) {
        // Déclenche un email de reset via Supabase
        const supabase = createClient();
        const { data: user } = await supabase.auth.admin.getUserById(userId);
        if (user?.user?.email) {
            await supabase.auth.resetPasswordForEmail(user.user.email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            setResetSuccess(userId);
            setTimeout(() => setResetSuccess(null), 3000);
        }
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
            <div>
                <h1 className="text-2xl font-bold text-white">Utilisateurs</h1>
                <p className="mt-1 text-sm text-white/40">{profiles.length} profil(s) enregistré(s)</p>
            </div>

            {/* Search */}
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher par nom ou entreprise..."
                    className="w-full rounded-lg border border-white/10 bg-white/6 py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-white/20"
                />
            </div>

            {/* Table */}
            <div className="rounded-xl border border-white/8 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/8 bg-white/4">
                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">Utilisateur</th>
                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">Entreprise</th>
                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">Rôle</th>
                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/6">
                        {filtered.map((profile) => {
                            const isUpdating = updatingId === profile.id;
                            const didReset = resetSuccess === profile.user_id;
                            return (
                                <tr key={profile.id} className="transition-colors hover:bg-white/3">
                                    <td className="px-5 py-3.5">
                                        <p className="font-medium text-white">{profile.first_name} {profile.last_name}</p>
                                    </td>
                                    <td className="px-5 py-3.5 text-white/50 text-xs">
                                        {profile.companies?.name ?? '—'}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${roleColors[profile.role] ?? 'bg-white/10 text-white/50'}`}>
                                            {profile.role}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <select
                                                defaultValue={profile.role}
                                                disabled={isUpdating || profile.role === 'super_admin'}
                                                onChange={(e) => changeRole(profile.id, e.target.value as Role)}
                                                className="rounded-md border border-white/10 bg-white/8 px-2 py-1 text-xs text-white outline-none cursor-pointer disabled:opacity-40"
                                            >
                                                {ROLES.map((r) => (
                                                    <option key={r} value={r} className="bg-[#1a1f28]">{r}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => resetPassword(profile.user_id)}
                                                disabled={isUpdating}
                                                title="Envoyer un email de réinitialisation"
                                                className="flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1 text-[11px] text-white/50 transition-colors hover:border-white/20 hover:text-white disabled:opacity-40"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                                {didReset ? 'Email envoyé !' : 'Reset MDP'}
                                            </button>
                                            {isUpdating && (
                                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-red-400" />
                                            )}
                                        </div>
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
