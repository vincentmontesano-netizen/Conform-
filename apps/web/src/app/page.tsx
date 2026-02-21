import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  FileText,
  BookOpen,
  HardHat,
  GraduationCap,
  ShieldCheck,
  Lock,
  Building2,
  Gavel,
  Table2,
  Globe,
  KeyRound,
  Zap,
} from 'lucide-react';

/* ─────────────────── DATA ─────────────────── */

const painPoints = [
  {
    icon: Gavel,
    title: 'Risque pénal réel',
    body: "En cas de contrôle ou d'accident, l'absence de DUERP ou de registres obligatoires expose le dirigeant à des sanctions pénales pouvant atteindre 75 000 € d'amende et 1 an d'emprisonnement.",
  },
  {
    icon: FileText,
    title: 'Le DUERP : obligatoire… et incompris',
    body: 'Le Document Unique est obligatoire dès le premier salarié et doit être mis à jour chaque année. Pourtant, 7 PME sur 10 n\'ont pas de DUERP conforme. Sa rédaction reste un casse-tête sans outil adapté.',
  },
  {
    icon: Table2,
    title: 'La gestion sur Excel, c\'est fini',
    body: 'Registres de vérification, dotations EPI, habilitations, formations à renouveler… Éparpillés sur des fichiers Excel partagés, ces données critiques sont ingérables. Un oubli peut coûter très cher.',
  },
];

const features = [
  {
    icon: FileText,
    tag: 'DUERP',
    title: 'DUERP rédigé en 15 minutes',
    body: 'Assistant guidé étape par étape par secteur d\'activité. Identification des risques, unités de travail, plan d\'actions PAPRIPACT. Génération PDF horodatée et versionning complet.',
  },
  {
    icon: BookOpen,
    tag: 'REGISTRES',
    title: 'Registres obligatoires centralisés',
    body: 'Tous vos registres de contrôle (extincteurs, installations électriques, ascenseurs…) en un seul endroit. Alertes automatiques avant chaque échéance de vérification périodique.',
  },
  {
    icon: HardHat,
    tag: 'EPI & FORMATIONS',
    title: 'Alertes de péremption intelligentes',
    body: 'Suivez les dates de péremption de vos EPI, les recyclages de formation CACES, habilitations électriques H0B0 et autres certifications. Aucune expiration ne passe inaperçue.',
  },
  {
    icon: ShieldCheck,
    tag: 'SÉCURITÉ JURIDIQUE',
    title: 'Archivage probant & signature eIDAS',
    body: 'Chaque document validé est horodaté, signé électroniquement (conforme eIDAS) et archivé de façon immuable. Votre audit trail tient lieu de preuve en cas de contrôle URSSAF ou inspection du travail.',
  },
];

const plans = [
  {
    name: 'Basic',
    price: 'Gratuit',
    period: '14 jours d\'essai',
    description: 'L\'essentiel pour démarrer votre mise en conformité.',
    features: ['DUERP guidé complet', 'Registres obligatoires', 'Export PDF', 'Audit trail', '1 site, 3 utilisateurs'],
    cta: 'Commencer gratuitement',
    href: '/register',
    accent: false,
    badge: null,
  },
  {
    name: 'Pro',
    price: '49€',
    period: '/ mois HT',
    description: 'Tous les modules V0 pour gérer la sécurité terrain.',
    features: ['Tout le plan Basic', 'Gestion EPI & dotations', 'Suivi formations & habilitations', 'Alertes péremption automatiques', 'Multi-sites, utilisateurs illimités'],
    cta: 'Passer au Pro',
    href: '/register?plan=pro',
    accent: true,
    badge: 'Recommandé',
  },
  {
    name: 'Premium',
    price: 'Bientôt',
    period: '— In Progress',
    description: 'Agents IA & inspecteur virtuel pour aller plus loin.',
    features: ['Tout le plan Pro', 'Agents IA conformité', 'Inspecteur virtuel', 'Analyse prédictive des risques', 'Support dédié'],
    cta: 'M\'alerter à la sortie',
    href: '/register?plan=premium',
    accent: false,
    badge: 'Bientôt disponible',
  },
  {
    name: 'Enterprise',
    price: 'Sur devis',
    period: '',
    description: 'Multi-sites complexes, groupes et API sur-mesure.',
    features: ['Tout le plan Premium', 'Multi-sites illimités', 'API REST dédiée', 'SSO & LDAP', 'SLA contractuel, CSM dédié'],
    cta: 'Nous contacter',
    href: 'mailto:contact@conform.plus',
    accent: false,
    badge: null,
  },
];

const footerLinks = [
  { label: 'Mentions légales', href: '#' },
  { label: 'Politique de confidentialité', href: '#' },
  { label: 'CGU', href: '#' },
  { label: 'Contact', href: 'mailto:contact@conform.plus' },
];

/* ─────────────────── PAGE ─────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen">

      {/* ══════════════════════════════ HERO ══════════════════════════════ */}
      <section className="relative overflow-hidden bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
        <div className="grain absolute inset-0" />
        {/* Diagonal accents */}
        <div className="absolute -right-40 top-0 bottom-0 w-80 bg-[hsl(var(--accent)/0.06)]" style={{ transform: 'skewX(-8deg)' }} />
        <div className="absolute -right-56 top-0 bottom-0 w-40 bg-[hsl(var(--accent)/0.03)]" style={{ transform: 'skewX(-8deg)' }} />

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-5 lg:px-16">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl italic">Conform</span>
            <span className="text-[hsl(var(--accent))] text-xl font-bold">+</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-md px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground)/0.8)] transition-colors hover:text-white">
              Se connecter
            </Link>
            <Link href="/register" className="btn-accent text-xs">
              Commencer <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-4xl px-8 pb-28 pt-20 text-center lg:px-16 lg:pb-36 lg:pt-28">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[hsl(var(--accent))]">
            Plateforme SaaS pour TPE &amp; PME
          </p>
          <h1 className="font-display text-5xl italic leading-tight tracking-tight lg:text-7xl">
            La conformité réglementaire,&nbsp;simplifiée.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[hsl(var(--primary-foreground)/0.65)] lg:text-lg">
            Dirigeants de TPE et PME : gérez votre DUERP, vos registres obligatoires,
            vos EPI et formations — sans expert RH ni cabinet juridique.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/register" className="btn-accent">
              Créer mon compte gratuitement <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium transition-all hover:bg-white/10">
              Se connecter
            </Link>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[hsl(var(--background))] to-transparent" />
      </section>

      {/* ══════════════════════════════ PAIN POINTS ══════════════════════════════ */}
      <section className="relative bg-background py-24 lg:py-28">
        <div className="mx-auto max-w-5xl px-8 lg:px-16">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Le problème</p>
            <h2 className="mt-3 font-display text-3xl italic text-foreground lg:text-4xl">
              La conformité, cauchemar des dirigeants de PME.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Chaque année, des milliers d&apos;entreprises s&apos;exposent à des sanctions évitables faute d&apos;outils adaptés.
            </p>
          </div>

          <div className="stagger-in mt-14 grid gap-6 md:grid-cols-3">
            {painPoints.map((p) => (
              <div key={p.title} className="rounded-xl border border-border bg-card p-7 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-destructive/8">
                  <p.icon className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="mt-5 text-base font-bold text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ FEATURES ══════════════════════════════ */}
      <section className="relative overflow-hidden bg-[hsl(var(--primary)/0.03)] py-24 lg:py-28">
        <div className="mx-auto max-w-5xl px-8 lg:px-16">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">La solution V0</p>
            <h2 className="mt-3 font-display text-3xl italic text-foreground lg:text-4xl">
              Tout ce qu&apos;il vous faut pour être en règle.
            </h2>
          </div>

          <div className="stagger-in mt-14 grid gap-7 md:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="card-accent rounded-xl border border-border bg-card p-7 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--accent)/0.12)]">
                    <f.icon className="h-5 w-5 text-accent" />
                  </div>
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">
                    {f.tag}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-bold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ PRICING ══════════════════════════════ */}
      <section className="relative bg-background py-24 lg:py-28" id="pricing">
        <div className="mx-auto max-w-6xl px-8 lg:px-16">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Tarifs</p>
            <h2 className="mt-3 font-display text-3xl italic text-foreground lg:text-4xl">
              Un forfait adapté à votre croissance.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Commencez gratuitement. Passez au Pro quand vous gérez la sécurité terrain.
            </p>
          </div>

          <div className="stagger-in mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={[
                  'relative flex flex-col rounded-xl border p-7 shadow-sm transition-shadow hover:shadow-md',
                  plan.accent
                    ? 'border-accent bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'border-border bg-card',
                ].join(' ')}
              >
                {plan.badge && (
                  <div className={[
                    'absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest',
                    plan.accent ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground border border-border',
                  ].join(' ')}>
                    {plan.badge}
                  </div>
                )}

                <p className={['text-xs font-semibold uppercase tracking-widest', plan.accent ? 'text-accent' : 'text-accent'].join(' ')}>
                  {plan.name}
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className={['text-3xl font-bold tracking-tight', plan.accent ? 'text-white' : 'text-foreground'].join(' ')}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={['text-xs', plan.accent ? 'text-white/60' : 'text-muted-foreground'].join(' ')}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={['mt-2 text-xs leading-relaxed', plan.accent ? 'text-white/70' : 'text-muted-foreground'].join(' ')}>
                  {plan.description}
                </p>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <CheckCircle className={['mt-0.5 h-3.5 w-3.5 shrink-0', plan.accent ? 'text-accent' : 'text-accent'].join(' ')} />
                      <span className={['text-xs leading-snug', plan.accent ? 'text-white/80' : 'text-muted-foreground'].join(' ')}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Link
                    href={plan.href}
                    className={[
                      'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all',
                      plan.accent
                        ? 'bg-accent text-accent-foreground hover:brightness-110'
                        : 'border border-border bg-background text-foreground hover:bg-muted',
                    ].join(' ')}
                  >
                    {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ CTA BANNER ══════════════════════════════ */}
      <section className="relative overflow-hidden bg-[hsl(var(--primary))] py-20 lg:py-24">
        <div className="grain absolute inset-0" />
        <div className="absolute -left-32 top-0 bottom-0 w-64 bg-[hsl(var(--accent)/0.05)]" style={{ transform: 'skewX(6deg)' }} />

        <div className="relative z-10 mx-auto max-w-3xl px-8 text-center text-[hsl(var(--primary-foreground))] lg:px-16">
          <h2 className="font-display text-3xl italic leading-tight lg:text-4xl">
            Prêt à sécuriser votre conformité&nbsp;?
          </h2>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
            {[
              'Conforme au Code du travail',
              'Données hébergées en UE',
              'Multi-sites et multi-utilisateurs',
              'Export PDF certifié',
            ].map((c) => (
              <li key={c} className="flex items-center gap-2 text-sm text-[hsl(var(--primary-foreground)/0.75)]">
                <CheckCircle className="h-4 w-4 text-[hsl(var(--accent))]" />
                {c}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Link href="/register" className="btn-accent">
              Commencer maintenant <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ FOOTER ══════════════════════════════ */}
      <footer className="border-t bg-background py-10">
        <div className="mx-auto max-w-5xl px-8 lg:px-16">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            {/* Brand */}
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-lg italic text-foreground">Conform</span>
                <span className="text-accent text-base font-bold">+</span>
              </div>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
                La plateforme de conformité réglementaire pour les TPE &amp; PME françaises.
              </p>
            </div>

            {/* Security badges */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Globe, label: 'Hébergement UE', sub: 'Données stockées en Europe' },
                { icon: Lock, label: 'Chiffrement AES-256', sub: 'En transit et au repos' },
                { icon: KeyRound, label: 'eIDAS', sub: 'Signature électronique conforme' },
                { icon: Zap, label: 'Audit trail', sub: 'Traçabilité immuable' },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3.5 py-2.5">
                  <badge.icon className="h-4 w-4 text-accent shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold text-foreground">{badge.label}</p>
                    <p className="text-[10px] text-muted-foreground">{badge.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 flex flex-col items-center gap-4 border-t border-border pt-6 md:flex-row md:justify-between">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} CONFORM+. Tous droits réservés.
            </p>
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
              {footerLinks.map((l) => (
                <Link key={l.label} href={l.href} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
