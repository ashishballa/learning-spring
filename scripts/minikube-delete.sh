#!/bin/bash
# Safe minikube delete - backs up database first
echo "=== Backing up database before deleting minikube ==="
bash "$(dirname "$0")/backup-db.sh"

if [ $? -eq 0 ]; then
  echo ""
  echo "=== Deleting minikube ==="
  minikube delete
else
  echo "Backup failed! Aborting minikube delete."
  exit 1
fi
