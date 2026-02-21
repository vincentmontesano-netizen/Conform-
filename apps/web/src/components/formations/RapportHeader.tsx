'use client';

interface RapportHeaderProps {
  companyName: string;
  generatedAt: string;
  title?: string;
  subtitle?: string;
}

export function RapportHeader({
  companyName,
  generatedAt,
  title = 'Rapport Formations & Habilitations',
  subtitle = 'Tableau de conformite reglementaire',
}: RapportHeaderProps) {
  const formattedDate = new Date(generatedAt).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="text-center mb-8 border-b-2 border-gray-900 pb-6">
      <h2 className="text-2xl font-bold uppercase tracking-wider">{title}</h2>
      <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
      <div className="mt-3 flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <span>Entreprise : <strong>{companyName}</strong></span>
        <span>Date : <strong>{formattedDate}</strong></span>
      </div>
    </div>
  );
}
