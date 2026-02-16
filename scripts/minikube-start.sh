#!/bin/bash
# Start minikube and restore database from latest backup
SCRIPT_DIR="$(dirname "$0")"
K8S_DIR="$SCRIPT_DIR/../k8s"
BACKUP_DIR="$SCRIPT_DIR/../backups"

echo "=== Starting minikube ==="
minikube start --driver=docker --memory=4096 --cpus=2

echo ""
echo "=== Building images ==="
eval $(minikube docker-env)
docker build -t my-backend-app:1.5 "$SCRIPT_DIR/../firstApp"
docker build -t my-frontend-app:1.4 "$SCRIPT_DIR/../food-frontend"

echo ""
echo "=== Enabling addons ==="
minikube addons enable metrics-server

echo ""
echo "=== Installing monitoring stack ==="
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts 2>/dev/null
helm repo update
if ! helm status monitoring -n monitoring &>/dev/null; then
  helm install monitoring prometheus-community/kube-prometheus-stack \
    --namespace monitoring --create-namespace \
    --set prometheus.prometheusSpec.resources.requests.memory=256Mi \
    --set prometheus.prometheusSpec.resources.limits.memory=512Mi \
    --set prometheus.prometheusSpec.retention=3d \
    --set grafana.resources.requests.memory=196Mi \
    --set grafana.resources.limits.memory=384Mi \
    --set alertmanager.alertmanagerSpec.resources.requests.memory=64Mi \
    --set alertmanager.alertmanagerSpec.resources.limits.memory=128Mi \
    --timeout 10m
else
  echo "Monitoring stack already installed, skipping."
fi
kubectl apply -f "$K8S_DIR/custom-alerts.yaml"

echo ""
echo "=== Deploying K8s resources ==="
kubectl apply -f "$K8S_DIR/postgres-secret.yaml"
kubectl apply -f "$K8S_DIR/postgres-pvc.yaml"
kubectl apply -f "$K8S_DIR/postgres-statefulset.yaml"
kubectl apply -f "$K8S_DIR/postgres-service.yaml"

echo "Waiting for postgres..."
kubectl wait --for=condition=ready pod/postgres-0 --timeout=120s

kubectl apply -f "$K8S_DIR/backend-deployment.yaml"
kubectl apply -f "$K8S_DIR/backend-service.yaml"
kubectl apply -f "$K8S_DIR/backend-hpa.yaml"
kubectl apply -f "$K8S_DIR/frontend-deployment.yaml"
kubectl apply -f "$K8S_DIR/frontend-service.yaml"
kubectl apply -f "$K8S_DIR/ingress.yaml"

echo "Waiting for backend..."
kubectl wait --for=condition=ready pod -l app=backend --timeout=120s

# Restore database if backup exists
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/firstappdb_*.sql 2>/dev/null | head -1)
if [ -n "$LATEST_BACKUP" ]; then
  echo ""
  echo "=== Restoring database from: $LATEST_BACKUP ==="
  kubectl exec -i postgres-0 -- sh -c "psql -U firstapp -d firstappdb" < "$LATEST_BACKUP"
  echo "Database restored!"
else
  echo ""
  echo "No backup found, starting with fresh database."
fi

echo ""
echo "=== All done! ==="
kubectl get pods
echo ""
echo "Run 'minikube tunnel' in a separate terminal to access the app."
