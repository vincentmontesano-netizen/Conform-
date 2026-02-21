'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardTimerProps {
  currentStep: number;
  totalSteps?: number;
}

const STEP_LABELS = ['Qualification', 'Risques', 'Actions', 'Validation'];
const ESTIMATED_MINUTES = 15;

export function WizardTimer({ currentStep, totalSteps = 4 }: WizardTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const isOverTime = minutes >= ESTIMATED_MINUTES;

  return (
    <div className="flex items-center gap-4">
      {/* Timer */}
      <div className={cn(
        'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
        isOverTime
          ? 'border-amber-300 bg-amber-50 text-amber-700'
          : 'border-muted bg-muted/30 text-muted-foreground'
      )}>
        <Clock className="h-3.5 w-3.5" />
        <span className="font-mono">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <span className="text-muted-foreground/70">/ ~{ESTIMATED_MINUTES} min</span>
      </div>

      {/* Step progress dots */}
      <div className="hidden sm:flex items-center gap-1">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isDone = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;
          return (
            <div key={label} className="flex items-center gap-1">
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors',
                  isDone && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary text-primary-foreground ring-2 ring-primary/30',
                  !isDone && !isCurrent && 'bg-muted text-muted-foreground'
                )}
                title={label}
              >
                {isDone ? <CheckCircle2 className="h-3 w-3" /> : stepNum}
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={cn(
                  'h-0.5 w-4',
                  isDone ? 'bg-primary' : 'bg-muted'
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
