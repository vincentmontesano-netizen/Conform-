# CLAUDE.md — Conform+

## Projet
Plateforme SaaS de conformite reglementaire HSE (DUERP, Registres, EPI, Formations, Inspection).
Monorepo pnpm + Turborepo.

## Stack
- **Web**: Next.js 15 + React 19 + TailwindCSS + React Query + Supabase Auth
- **API**: NestJS 10 + Supabase (service_role) + class-validator
- **Rules Engine**: Python FastAPI + Pydantic
- **Shared**: TypeScript types/utils (@conform-plus/shared)
- **DB**: Supabase (PostgreSQL) — migrations dans supabase/migrations/

## Commandes

```bash
pnpm install          # Installer les dependances
pnpm dev              # Lancer tous les serveurs (web:3000, api:3001, rules:8000)
pnpm dev:web          # Next.js seul
pnpm dev:api          # NestJS seul
pnpm build            # Build tous les packages
pnpm test             # Tests tous les workspaces
```

### API seule
```bash
cd apps/api
pnpm dev              # nest start --watch (port 3001)
pnpm test             # Jest unit tests
pnpm test:e2e         # Jest e2e tests
```

### Rules Engine
```bash
cd services/rules-engine
uvicorn app.main:app --reload --port 8000
pytest                # 57 tests Python
```

## Architecture

```
conform-plus/
├── apps/web/              # Next.js frontend
│   └── src/app/(protected)/ # Pages authentifiees (layout avec Sidebar)
│   └── src/app/(auth)/      # Pages auth (login, register, forgot-password)
│   └── src/hooks/           # React Query hooks (useCompany, useDashboard, etc.)
│   └── src/lib/api.ts       # Client HTTP → API NestJS (Bearer token)
│   └── src/lib/supabase/    # Clients Supabase (client.ts, server.ts, middleware.ts)
├── apps/api/              # NestJS backend
│   └── src/modules/         # Modules: company, duerp, registre, epi, formation, employee, compliance, inspection
│   └── src/common/guards/   # SupabaseAuthGuard + RolesGuard
├── services/rules-engine/ # Python FastAPI
│   └── app/engine/rules/    # Regles de conformite (DUERP, EPI, Formations, Registres)
├── packages/shared/       # Types + schemas Zod partages
├── supabase/migrations/   # 30 fichiers SQL (00001 → 00030)
└── docker/                # Docker Compose dev + prod
```

## Patterns importants

### Auth
- Supabase Auth (JWT). Le middleware Next.js verifie la session et redirige.
- L'API NestJS valide le Bearer token via `SupabaseAuthGuard` → charge le profil → injecte `request.user`.
- `@CurrentUser()` decorator pour acceder au user dans les controllers.
- `@Roles('admin', 'rh')` pour restreindre par role.
- `@AllowWhenNoCompany()` pour les endpoints accessibles sans company_id (creation entreprise).

### API prefix
Toutes les routes NestJS sont prefixees `/api/v1` (global prefix dans main.ts).

### Supabase
- L'API utilise `SUPABASE_SERVICE_ROLE_KEY` (bypass RLS).
- Le frontend utilise `SUPABASE_ANON_KEY` (soumis aux RLS).
- Fonctions RLS: `user_company_id()`, `user_role()` definies dans migration 00011.

### React Query
Tous les hooks dans `apps/web/src/hooks/` suivent le pattern:
- `useXxx()` → `useQuery` pour les lectures
- `useCreateXxx()` → `useMutation` pour les ecritures
- `api.get/post/patch/delete` dans `lib/api.ts`

### Onboarding
- Le trigger `handle_new_user` cree un profil avec `company_id = NULL`.
- Le middleware redirige vers `/companies/new` si pas de company_id.
- L'endpoint `GET /companies/auto-link` lie automatiquement une entreprise existante.

## Gotchas

- **Build API**: `nest build` genere dans `dist/src/main.js` (pas `dist/main.js`). Lancer avec `node dist/src/main.js`.
- **Migrations**: Les fichiers SQL dans `supabase/migrations/` doivent etre appliques manuellement dans le SQL Editor Supabase.
- **Shared package**: Toujours builder `packages/shared` avant `apps/web` ou `apps/api` (`pnpm build` via Turbo le fait automatiquement).
- **Tests E2E API**: Necessitent un mock de `SupabaseService` (voir `test/app.e2e-spec.ts`).
- **moduleNameMapper Jest**: Le mapper `.js → .ts` doit etre scope aux chemins relatifs: `^(\\.{1,2}/.*)\\.[jt]s$` (sinon il catch les packages npm).
- **Roles**: `user_role` enum = `admin | rh | manager | inspecteur`. Le role `super_admin` est dans profiles.role mais PAS dans l'enum SQL (ajout migration 00024).
- **Port 3001**: Si l'API crash avec `EADDRINUSE`, tuer le processus: `lsof -ti:3001 | xargs kill -9`.

## Variables d'environnement

Fichier `.env.local` requis dans `apps/web/` et `apps/api/`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## Style de code

- TypeScript strict, imports avec alias `@/` (web) et `@conform-plus/shared`
- NestJS: DTOs avec class-validator, modules separes par domaine
- Frontend: composants dans `components/`, pages dans `app/`, hooks dans `hooks/`
- SQL: snake_case, RLS sur toutes les tables, triggers `update_updated_at_column()`
- Langue UI: Francais
