'use client';

import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  HeartPulse,
  AlertOctagon,
  GraduationCap,
  BadgeCheck,
  Building,
  Lock,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RegistreTemplate } from '@conform-plus/shared';

const ICON_MAP: Record<string, React.ElementType> = {
  Users,
  ShieldCheck,
  HeartPulse,
  AlertOctagon,
  GraduationCap,
  BadgeCheck,
  Building,
  Lock,
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

interface RegistreCardProps {
  template: RegistreTemplate;
  entriesCount?: number;
  expiringCount?: number;
  exists?: boolean;
}

export function RegistreCard({ template, entriesCount = 0, expiringCount = 0, exists = false }: RegistreCardProps) {
  const Icon = ICON_MAP[template.icon] || Users;
  const colors = COLOR_MAP[template.color] || COLOR_MAP.blue;

  return (
    <Link
      href={`/registres/${template.type}`}
      className={cn(
        'group card-accent relative flex flex-col rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md',
        colors.border
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className={cn('rounded-lg p-2.5', colors.bg)}>
          <Icon className={cn('h-5 w-5', colors.text)} />
        </div>
        {expiringCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
            <AlertTriangle className="h-3 w-3" />
            {expiringCount}
          </span>
        )}
      </div>

      {/* Content */}
      <h3 className="mt-3 text-sm font-semibold text-foreground">{template.label}</h3>
      <p className="mt-1 flex-1 text-xs text-muted-foreground line-clamp-2">{template.description}</p>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-2">
          {exists ? (
            <span className="text-xs text-muted-foreground">{entriesCount} entree(s)</span>
          ) : (
            <span className="text-xs text-muted-foreground italic">Non initialise</span>
          )}
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>

      {/* Legal ref */}
      <p className="mt-1 text-[10px] text-muted-foreground/60">{template.legalRef}</p>
    </Link>
  );
}
