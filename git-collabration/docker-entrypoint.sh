#!/bin/sh
set -e

echo "==> Starting Git Collaborator Access Manager Frontend..."

if [ -n "$DATABASE_URL" ]; then
  echo "==> Checking database connection and syncing Prisma schema..."
  MAX_RETRIES=15
  RETRY_COUNT=0
  until npx prisma db push --skip-generate || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "==> Database not ready yet (attempt $RETRY_COUNT/$MAX_RETRIES). Retrying in 2 seconds..."
    sleep 2
  done

  if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "==> Warning: Database schema push did not complete within timeout. Proceeding with application startup..."
  else
    echo "==> Database schema synchronized successfully."
  fi
fi

exec "$@"
