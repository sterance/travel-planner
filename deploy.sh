#!/bin/bash
set -e

ENVIRONMENT=${1:-dev}

if [ "$ENVIRONMENT" = "prod" ]; then
  if [ -z "$VPS_IP" ] || [ -z "$VPS_USER" ]; then
    echo "Usage: VPS_IP=1.2.3.4 VPS_USER=root ./deploy.sh prod"
    exit 1
  fi
  ssh "$VPS_USER@$VPS_IP" "cd /root/travel && git pull && docker compose -f docker-compose.prod.yml up -d --build"
else
  docker compose -f docker-compose.dev.yml up --build
fi
