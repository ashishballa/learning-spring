#!/bin/bash
# Backup PostgreSQL database from Kubernetes to local machine
# Usage: ./scripts/backup-db.sh

BACKUP_DIR="$(dirname "$0")/../backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/firstappdb_$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

echo "Backing up database..."
kubectl exec postgres-0 -- sh -c "pg_dump -U firstapp -d firstappdb" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "Backup saved: $BACKUP_FILE ($SIZE)"
else
  echo "Backup failed!"
  rm -f "$BACKUP_FILE"
  exit 1
fi
