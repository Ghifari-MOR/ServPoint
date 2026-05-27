#!/usr/bin/env bash
set -euo pipefail

echo "Searching for project root..."
FOUND_PATH="$(find / -maxdepth 3 \( -type d -name .git -o -name package.json -o -name manage.py \) 2>/dev/null | head -n 1)"

if [ -z "${FOUND_PATH:-}" ]; then
  echo "Project root not found."
  exit 1
fi

if [ -d "$FOUND_PATH" ] && [ "$(basename "$FOUND_PATH")" = ".git" ]; then
  PROJECT_ROOT="$(dirname "$FOUND_PATH")"
else
  PROJECT_ROOT="$(dirname "$(dirname "$FOUND_PATH")")"
fi

if [ -z "${PROJECT_ROOT:-}" ] || [ ! -d "$PROJECT_ROOT" ]; then
  echo "Project root not found."
  exit 1
fi

echo "Project root: $PROJECT_ROOT"
cd "$PROJECT_ROOT"

git remote -v
git pull origin main

if [ -d "loservice_frontend" ]; then
  cd loservice_frontend
  npm install
  npm run build
  cd ..
fi

if systemctl list-units --type=service | grep -qi gunicorn; then
  GUNICORN_SERVICE="$(systemctl list-units --type=service | grep -i gunicorn | head -n 1 | awk '{print $1}')"
  echo "Restarting $GUNICORN_SERVICE"
  sudo systemctl restart "$GUNICORN_SERVICE"
fi

if systemctl list-units --type=service | grep -qi nginx; then
  sudo systemctl reload nginx
fi

git log -1 --oneline