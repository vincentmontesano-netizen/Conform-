'use client';

import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardTooltipProps {
  content: string;
  title?: string;
  className?: string;
}

export function WizardTooltip({ content, title, className }: WizardTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={cn('relative inline-flex', className)} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-muted-foreground hover:text-primary transition-colors"
        aria-label="Aide"
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2">
          <div className="rounded-lg border bg-popover p-3 shadow-lg">
            {/* Arrow */}
            <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t bg-popover" />
            {title && (
              <p className="mb-1.5 text-xs font-semibold text-foreground">{title}</p>
            )}
            <p className="text-xs leading-relaxed text-muted-foreground">{content}</p>
          </div>
        </div>
      )}
    </div>
  );
}
