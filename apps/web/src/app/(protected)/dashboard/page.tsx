export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tableau de bord</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Score de conformite */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-medium text-muted-foreground">
            Score de conformite
          </h2>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary">
              <span className="text-2xl font-bold">--</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Creez votre premier DUERP pour obtenir votre score.
            </p>
          </div>
        </div>

        {/* Alertes critiques */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-medium text-muted-foreground">
            Alertes critiques
          </h2>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Aucune alerte pour le moment.
            </p>
          </div>
        </div>

        {/* Actions prioritaires */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-medium text-muted-foreground">
            Actions prioritaires
          </h2>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Aucune action en attente.
            </p>
          </div>
        </div>

        {/* Activite recente */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-medium text-muted-foreground">
            Activite recente
          </h2>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Aucune activite enregistree.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
