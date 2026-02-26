'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, User, X } from 'lucide-react';
import { useEmployeeSearch } from '@/hooks/useEmployee';
import { cn } from '@/lib/utils';
import type { EmployeeSearchResult } from '@conform-plus/shared';

interface EmployeeSelectorProps {
  value?: { id: string; nom: string; prenom: string; poste: string | null } | null;
  onChange: (employee: EmployeeSearchResult | null) => void;
  placeholder?: string;
  className?: string;
}

export function EmployeeSelector({
  value,
  onChange,
  placeholder = 'Rechercher un salarie...',
  className,
}: EmployeeSelectorProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results, isLoading } = useEmployeeSearch(query);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(employee: EmployeeSearchResult) {
    onChange(employee);
    setQuery('');
    setIsOpen(false);
  }

  function handleClear() {
    onChange(null);
    setQuery('');
    inputRef.current?.focus();
  }

  if (value) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-md border bg-card px-3 py-2',
          className,
        )}
      >
        <User className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium">
            {value.nom} {value.prenom}
          </span>
          {value.poste && (
            <span className="ml-2 text-xs text-muted-foreground">{value.poste}</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="shrink-0 rounded p-0.5 hover:bg-muted transition-colors"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-md border bg-card pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-card shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
              Recherche...
            </div>
          ) : !results || results.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
              Aucun salarie trouve
            </div>
          ) : (
            results.map((employee) => (
              <button
                key={employee.id}
                type="button"
                onClick={() => handleSelect(employee)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted transition-colors"
              >
                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <span className="text-sm font-medium">
                    {employee.nom} {employee.prenom}
                  </span>
                  {employee.poste && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {employee.poste}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
