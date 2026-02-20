'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  FileText,
  AlertTriangle,
  ScrollText,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Entreprises', href: '/companies', icon: Building2 },
  { name: 'DUERP', href: '/duerp', icon: FileText },
  { name: 'Alertes', href: '/alerts', icon: AlertTriangle },
  { name: 'Journal d\'audit', href: '/audit-log', icon: ScrollText },
  { name: 'Parametres', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="relative flex h-screen w-[260px] flex-col bg-sidebar-bg overflow-hidden">
      {/* Grain texture */}
      <div className="grain absolute inset-0 opacity-40" />

      {/* Subtle gradient overlay at top */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[hsl(var(--accent)/0.06)] to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="relative z-10 flex h-16 items-center px-7">
        <Link href="/dashboard" className="flex items-baseline gap-1 group">
          <span className="font-display text-xl italic text-sidebar-fg transition-colors group-hover:text-white">
            Conform
          </span>
          <span className="text-sidebar-active text-lg font-bold">+</span>
        </Link>
      </div>

      {/* Divider */}
      <div className="relative z-10 mx-5 h-px bg-white/8" />

      {/* Navigation */}
      <nav className="relative z-10 flex-1 space-y-0.5 px-3 py-5">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-md px-4 py-2.5 text-[13px] font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-hover text-white'
                  : 'text-sidebar-fg hover:bg-sidebar-hover/60 hover:text-white',
              )}
            >
              <item.icon
                className={cn(
                  'h-[18px] w-[18px] shrink-0 transition-colors',
                  isActive ? 'text-sidebar-active' : 'text-sidebar-fg/60 group-hover:text-sidebar-fg',
                )}
              />
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <ChevronRight className="h-3 w-3 text-sidebar-active" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="relative z-10 mx-5 h-px bg-white/8" />
      <div className="relative z-10 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-[13px] font-medium text-sidebar-fg/70 transition-all duration-200 hover:bg-sidebar-hover/60 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Deconnexion
        </button>
      </div>
    </aside>
  );
}
