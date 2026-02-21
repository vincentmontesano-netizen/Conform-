'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Filter } from 'lucide-react';

interface AuditLog {
    id: string;
    action: string;
    table_name: string;
    record_id: string | null;
    old_data: Record<string, unknown> | null;
    new_data: Record<string, unknown> | null;
    user_id: string;
    company_id: string | null;
    created_at: string;
    profiles?: { first_name: string; last_name: string } | null;
    companies?: { name: string } | null;
}

const actionColors: Record<string, string> = {
    INSERT: 'bg-green-500/15 text-green-400',
    UPDATE: 'bg-blue-500/15 text-blue-400',
    DELETE: 'bg-red-500/15 text-red-400',
};

export default function AdminAuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterAction, setFilterAction] = useState('');
    const [filterCompany, setFilterCompany] = useState('');
    const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        async function load() {
            const supabase = createClient();

            const companiesRes = await supabase
                .from('companies')
                .select('id, name')
                .order('name');
            setCompanies(companiesRes.data ?? []);

            let query = supabase
                .from('audit_logs')
                .select('*, profiles(first_name, last_name), companies(name)')
                .order('created_at', { ascending: false })
                .limit(200);

            if (filterAction) query = query.eq('action', filterAction);
            if (filterCompany) query = query.eq('company_id', filterCompany);

            const { data } = await query;
            setLogs((data as AuditLog[]) ?? []);
            setIsLoading(false);
        }

        setIsLoading(true);
        load();
    }, [filterAction, filterCompany]);

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
                <h1 className="text-2xl font-bold text-white">Journal d&apos;audit</h1>
                <p className="mt-1 text-sm text-white/40">Traçabilité centralisée de toutes les actions critiques — cross-tenant</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <Filter className="h-4 w-4 text-white/30" />

                <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="rounded-lg border border-white/10 bg-white/6 px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                    <option value="" className="bg-[#1a1f28]">Toutes les actions</option>
                    <option value="INSERT" className="bg-[#1a1f28]">INSERT</option>
                    <option value="UPDATE" className="bg-[#1a1f28]">UPDATE</option>
                    <option value="DELETE" className="bg-[#1a1f28]">DELETE</option>
                </select>

                <select
                    value={filterCompany}
                    onChange={(e) => setFilterCompany(e.target.value)}
                    className="rounded-lg border border-white/10 bg-white/6 px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                    <option value="" className="bg-[#1a1f28]">Toutes les entreprises</option>
                    {companies.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#1a1f28]">{c.name}</option>
                    ))}
                </select>

                <span className="ml-auto text-xs text-white/30">{logs.length} entrée(s)</span>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-white/8 overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm">
                    <thead>
                        <tr className="border-b border-white/8 bg-white/4">
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">Date</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">Action</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">Table</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">Utilisateur</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">Entreprise</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/6">
                        {logs.map((log) => (
                            <tr key={log.id} className="transition-colors hover:bg-white/3">
                                <td className="px-4 py-3 text-xs text-white/40 whitespace-nowrap">
                                    {new Date(log.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${actionColors[log.action] ?? 'bg-white/10 text-white/50'}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-white/60">{log.table_name}</td>
                                <td className="px-4 py-3 text-xs text-white/70">
                                    {log.profiles
                                        ? `${log.profiles.first_name} ${log.profiles.last_name}`
                                        : log.user_id?.slice(0, 8) + '…'}
                                </td>
                                <td className="px-4 py-3 text-xs text-white/50">
                                    {log.companies?.name ?? '—'}
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center text-sm text-white/30">
                                    Aucune entrée dans le journal d&apos;audit.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
