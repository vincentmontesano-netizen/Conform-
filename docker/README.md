# Docker — Conform+

Stack containerisée : **web** (Next.js), **api** (NestJS), **rules-engine** (FastAPI).

## Prérequis

- Docker & Docker Compose
- Fichier `.env` à la racine (voir `.env.example`)

## Dev (recommandé)

Depuis la **racine du repo** :

```bash
# Lancer toute la stack (web + api + rules-engine)
docker compose up

# Ou en arrière-plan
docker compose up -d
```

- **Web** : http://localhost:3000  
- **API** : http://localhost:3001  
- **Rules engine** : http://localhost:8000  

Les volumes montent le code local ; les changements sont pris en compte (hot reload).

## Production

Build et démarrage des images optimisées :

```bash
docker compose -f docker/docker-compose.prod.yml up -d --build
```

Les variables d’environnement (Supabase, CORS, etc.) doivent être définies dans `.env` ou exportées.

## Fichiers

| Fichier | Rôle |
|--------|------|
| `Dockerfile.web` / `Dockerfile.web.prod` | App Next.js |
| `Dockerfile.api` / `Dockerfile.api.prod` | API NestJS |
| `docker-compose.dev.yml` | Stack dev (avec volumes) |
| `docker-compose.prod.yml` | Stack prod (multi-stage build) |

Le service **rules-engine** utilise les `Dockerfile` dans `services/rules-engine/`.
