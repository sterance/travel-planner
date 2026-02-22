# Deployment

## Overview

- **Frontend**: Static site (Vite build) can be deployed to Cloudflare Pages. Guest mode works without a backend.
- **Backend**: Node.js API + SQLite in a Docker container. Run on a home server for dev/demo or on a VPS for production.

## Cloudflare Pages (main and backend branches)

Pushes to `main` deploy the frontend to your production URL (e.g. `travel.<your-domain>`). Pushes to `backend` deploy to your beta URL (e.g. `beta.travel.<your-domain>`). Both builds use the same backend URL (e.g. `travel-backend.<your-domain>`); set GitHub repo secret `VITE_API_URL` to that URL.

In Cloudflare Pages for this project: set **Production branch** to `main`. Then in **Custom domains** assign your production frontend hostname to Production and your beta frontend hostname to the `backend` branch (preview). See Workers & Pages -> your project -> Settings (Builds & deployments, Production branch) and Custom domains.

Backend is shared: one API serves both frontends. Run it on a home server with `server/.env` containing `JWT_SECRET` and `CORS_ORIGINS`. `CORS_ORIGINS` must include both frontend origins (production and beta), comma-separated, e.g. `https://travel.<your-domain>,https://beta.travel.<your-domain>`. Expose the API via Cloudflare Tunnel: create a tunnel, add a public hostname for the backend pointing to `http://localhost:3000`, then on the server run `cloudflared service install <tunnel-token>` and start the service.

## Backend (Docker)

### Prerequisites

- Docker and Docker Compose
- `server/.env` with at least `JWT_SECRET` (min 32 chars). Copy from `server/.env.example`.

### Development / demo (home server)

```bash
# from repo root; ensure server/.env exists with JWT_SECRET and optional CORS_ORIGINS
docker compose -f docker-compose.dev.yml up --build
```

API listens on port 3000. Frontend: run `npm run dev` and set `VITE_API_URL=http://localhost:3000` (default in `.env.development`).

### Production (VPS)

1. On the VPS: clone repo, create `server/.env` with `JWT_SECRET`, `CORS_ORIGINS` (frontend origin: `https://travel.<DOMAIN>`).
2. From your machine:

```bash
VPS_IP=1.2.3.4 VPS_USER=root ./deploy.sh prod
```

Or on the VPS: `docker compose -f docker-compose.prod.yml up -d --build`. Expose port 3000 via nginx or Caddy and point `travel-backend.<DOMAIN>` to it. Frontend at `travel.<DOMAIN>`. `<DOMAIN>` is the value in `domain.env`.

### Cloudflare Tunnel (demo from outside your network)

If you already use Cloudflare Tunnel, add ingress for frontend and backend (same domain as in `domain.env`):

```yaml
# ~/.cloudflared/config.yml (add to existing ingress list)
  - hostname: travel.<DOMAIN>
    service: http://localhost:5173
  - hostname: travel-backend.<DOMAIN>
    service: http://localhost:3000
```

Run `npm run dev:all` once so `server/.env` has `CORS_ORIGINS` including `https://travel.<DOMAIN>`. For local dev with tunnel, run `npm run dev:all` for client+server, or run the backend with `source domain.env && docker compose -f docker-compose.dev.yml up` and start the tunnel; frontend at `https://travel.<DOMAIN>`, API at `https://travel-backend.<DOMAIN>`.

## Frontend env

- **Development**: `.env.development` sets `VITE_API_URL=http://localhost:3000`.
- **Production**: Set `DOMAIN` in `domain.env`, then run `npm run dev:all` once to write `.env.production` and `server/.env` CORS. Override in CI if needed.

## Database

SQLite file path is controlled by `DB_PATH` (default in container: `/app/data/travel.db`). Dev compose mounts `./server/data`; prod uses a named volume `app-data`. Back up the DB file regularly on production.
