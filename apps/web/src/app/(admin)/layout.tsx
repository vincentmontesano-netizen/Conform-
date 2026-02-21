import { Sidebar } from '@/components/layout/Sidebar';
import { BookOpen, ShieldCheck, Users, Building2, ScrollText, BarChart3, LogOut } from 'lucide-react';
import Link from 'next/link';

const adminNav = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Entreprises', href: '/admin/companies', icon: Building2 },
    { name: 'Utilisateurs', href: '/admin/users', icon: Users },
    { name: 'Journal d\'audit', href: '/admin/audit', icon: ScrollText },
    { name: 'Base Knowledge', href: '/admin/knowledge', icon: BookOpen }, // NOUVEAU
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-[#0f1117]">
            {/* Admin Sidebar — visuellement distinct du portail client */}
            <aside className="flex h-screen w-[240px] flex-col border-r border-white/8 bg-[#161b22]">
                {/* Logo */}
                <div className="flex h-16 items-center gap-3 px-6 border-b border-white/8">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500/20">
                        <ShieldCheck className="h-4 w-4 text-red-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white">Back-office</p>
                        <p className="text-[10px] text-white/40">Super Admin</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-0.5 px-3 py-4">
                    {adminNav.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium text-white/60 transition-all hover:bg-white/6 hover:text-white"
                        >
                            <item.icon className="h-4 w-4 shrink-0" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="border-t border-white/8 p-3">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium text-white/40 transition-all hover:bg-white/6 hover:text-white/70"
                    >
                        <LogOut className="h-4 w-4" />
                        Retour client
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto bg-[#0f1117]">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
