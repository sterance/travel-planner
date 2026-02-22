#!/usr/bin/env bash
# writes .env.production from domain.env so build uses DOMAIN in one place
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

if [ -f "domain.env" ]; then
  # shellcheck source=/dev/null
  source domain.env
  if [ -n "$DOMAIN" ]; then
    echo "VITE_API_URL=https://travel-backend.${DOMAIN}" > .env.production
  fi
fi
