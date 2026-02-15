#!/bin/bash
# Restore PostgreSQL database from a backup file
# Usage: ./scripts/restore-db.sh [backup_file]
#   If no file specified, uses the latest backup

BACKUP_DIR="$(dirname "$0")/../backups"

if [ -n "$1" ]; then
  BACKUP_FILE="$1"
else
  BACKUP_FILE=$(ls -t "$BACKUP_DIR"/firstappdb_*.sql 2>/dev/null | head -1)
fi

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "No backup file found!"
  echo "Usage: ./scripts/restore-db.sh [backup_file]"
  exit 1
fi

echo "Restoring from: $BACKUP_FILE"
echo "This will overwrite the current database. Continue? (y/n)"
read -r CONFIRM
if [ "$CONFIRM" != "y" ]; then
  echo "Cancelled."
  exit 0
fi

kubectl exec -i postgres-0 -- sh -c "psql -U firstapp -d firstappdb" < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Restore complete!"
else
  echo "Restore failed!"
  exit 1
fi
