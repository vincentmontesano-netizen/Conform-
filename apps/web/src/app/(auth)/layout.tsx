import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[hsl(var(--primary))]">
        {/* Grain overlay */}
        <div className="grain absolute inset-0" />

        {/* Diagonal geometric accent */}
        <div
          className="absolute -right-32 top-0 bottom-0 w-64 bg-[hsl(var(--accent)/0.08)]"
          style={{ transform: 'skewX(-6deg)' }}
        />
        <div
          className="absolute -right-48 top-0 bottom-0 w-32 bg-[hsl(var(--accent)/0.05)]"
          style={{ transform: 'skewX(-6deg)' }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-[hsl(var(--primary-foreground))]">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl italic">Conform</span>
              <span className="text-[hsl(var(--accent))] text-2xl font-bold">+</span>
            </div>
          </div>

          <div className="max-w-sm">
            <h2 className="font-display text-4xl italic leading-tight tracking-tight">
              La conformite reglementaire, simplifiee.
            </h2>
            <p className="mt-6 text-sm leading-relaxed opacity-70">
              Gerez vos Documents Uniques, evaluez vos risques, et restez en conformite
              avec une plateforme pensee pour les TPE et PME francaises.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs opacity-50">
            <div className="h-px w-8 bg-current" />
            <span>Plateforme SaaS B2B</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="relative flex flex-1 items-center justify-center px-6 py-12 bg-background">
        <Link
          href="/"
          className="absolute top-6 right-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
