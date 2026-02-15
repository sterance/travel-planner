#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

if [ -f "domain.env" ]; then
  # shellcheck source=/dev/null
  source domain.env
  if [ -n "$DOMAIN" ]; then
    echo "VITE_API_URL=https://travel-backend.${DOMAIN}" > .env.production
    echo "[dev-all] wrote .env.production (VITE_API_URL=https://travel-backend.${DOMAIN})"
    CORS_PART="http://localhost:5173"
    [ -n "$DEVSERVER" ] && CORS_PART="${CORS_PART},http://${DEVSERVER}:5173"
    CORS_LINE="CORS_ORIGINS=${CORS_PART},https://travel.${DOMAIN}"
    SERVER_ENV="server/.env"
    if [ -f "$SERVER_ENV" ]; then
      grep -v '^CORS_ORIGINS=' "$SERVER_ENV" > "${SERVER_ENV}.tmp" || true
      echo "$CORS_LINE" >> "${SERVER_ENV}.tmp"
      mv "${SERVER_ENV}.tmp" "$SERVER_ENV"
    else
      echo "$CORS_LINE" > "$SERVER_ENV"
      echo "[dev-all] created server/.env; add JWT_SECRET and other vars from server/.env.example"
    fi
    echo "[dev-all] wrote CORS_ORIGINS to server/.env"
  fi
fi

exec npx concurrently --names "client,server" "npm run dev" "npm run dev --prefix server"
