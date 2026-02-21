'use client';

import Link from 'next/link';
import {
  HardHat,
  Ear,
  Eye,
  Wind,
  Hand,
  Footprints,
  ArrowDownToLine,
  Sparkles,
  Shirt,
  Volume2,
  ArrowRight,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EpiCategory } from '@conform-plus/shared';

const ICON_MAP: Record<string, React.ElementType> = {
  HardHat,
  Ear,
  Eye,
  Wind,
  Hand,
  Footprints,
  ArrowDownToLine,
  Sparkles,
  Shirt,
  Volume2,
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  brown: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  lime: { bg: 'bg-lime-50', text: 'text-lime-600', border: 'border-lime-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
};

interface EpiCategoryCardProps {
  category: EpiCategory & { items_count: number };
  presetIcon?: string;
  presetColor?: string;
}

export function EpiCategoryCard({ category, presetIcon, presetColor }: EpiCategoryCardProps) {
  const Icon = (presetIcon && ICON_MAP[presetIcon]) || Package;
  const colors = (presetColor && COLOR_MAP[presetColor]) || COLOR_MAP.blue;

  return (
    <Link
      href={`/epi/inventaire?category_id=${category.id}`}
      className={cn(
        'group card-accent relative flex flex-col rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md',
        colors.border,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className={cn('rounded-lg p-2.5', colors.bg)}>
          <Icon className={cn('h-5 w-5', colors.text)} />
        </div>
        {category.norme && (
          <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
            {category.norme}
          </span>
        )}
      </div>

      {/* Content */}
      <h3 className="mt-3 text-sm font-semibold text-foreground">{category.name}</h3>
      {category.description && (
        <p className="mt-1 flex-1 text-xs text-muted-foreground line-clamp-2">{category.description}</p>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <span className="text-xs text-muted-foreground">
          {category.items_count} equipement(s)
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>

      {/* Duree de vie & controle */}
      <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground/60">
        {category.duree_vie_mois && <span>Duree: {category.duree_vie_mois} mois</span>}
        {category.controle_periodique_mois && <span>Controle: {category.controle_periodique_mois} mois</span>}
      </div>
    </Link>
  );
}
