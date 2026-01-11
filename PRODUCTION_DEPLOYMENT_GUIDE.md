# KiTS Hub Production Deployment Guide

## Overview

This comprehensive guide covers the complete production deployment of the KiTS Hub micro-frontend architecture, including infrastructure setup, application deployment, monitoring, and maintenance procedures.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Application Deployment](#application-deployment)
4. [Monitoring & Observability](#monitoring--observability)
5. [Performance Optimization](#performance-optimization)
6. [Security Configuration](#security-configuration)
7. [Maintenance & Operations](#maintenance--operations)
8. [Troubleshooting](#troubleshooting)
9. [Disaster Recovery](#disaster-recovery)

## Prerequisites

### System Requirements

- **Kubernetes Cluster**: v1.28+ with at least 3 nodes
- **Node Specifications**: Minimum 4 CPU, 8GB RAM per node
- **Storage**: 100GB SSD for persistent storage
- **Network**: 1Gbps+ network connectivity
- **Load Balancer**: External load balancer with SSL termination

### Software Requirements

- **Docker**: v20.10+
- **kubectl**: v1.28+
- **Helm**: v3.12+
- **Git**: v2.40+
- **Node.js**: v20+ (for local builds)

### External Services

- **Database**: PostgreSQL 14+ (Supabase recommended)
- **Cache**: Redis 7+
- **CDN**: Cloudflare/AWS CloudFront/Azure CDN
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack or similar
- **Secrets Management**: Kubernetes Secrets or external vault

## Infrastructure Setup

### 1. Kubernetes Cluster Configuration

```bash
# Create namespace
kubectl create namespace kits-hub

# Apply resource quotas
kubectl apply -f k8s/resource-quota.yaml

# Set up network policies
kubectl apply -f k8s/network-policy.yaml
```

### 2. Database Setup

```bash
# Deploy PostgreSQL
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgresql bitnami/postgresql \
  --namespace kits-hub \
  --set auth.postgresPassword=your-secure-password \
  --set auth.database=kits_hub \
  --set primary.persistence.size=100Gi

# Deploy Redis
helm install redis bitnami/redis \
  --namespace kits-hub \
  --set auth.password=your-redis-password \
  --set master.persistence.size=20Gi
```

### 3. Ingress Configuration

```bash
# Install NGINX Ingress Controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace

# Apply ingress configuration
kubectl apply -f k8s/ingress.yaml
```

### 4. SSL Certificate Setup

```bash
# Install Cert-Manager
helm repo add jetstack https://charts.jetstack.io
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true

# Create ClusterIssuer
kubectl apply -f k8s/cert-manager/cluster-issuer.yaml
```

## Application Deployment

### 1. Build and Push Docker Images

```bash
# Build all applications
for app in shell inventory pos crm hr accounting analytics; do
  if [ "$app" = "shell" ]; then
    cd shared-shell
  else
    cd solutions/${app}-management
  fi
  
  # Build and push Docker image
  docker build -t kits-hub/${app}:latest .
  docker push kits-hub/${app}:latest
  
  cd - > /dev/null
done
```

### 2. Configure Secrets

```bash
# Create secrets from environment file
kubectl create secret generic kits-hub-secrets \
  --from-env-file=.env.production \
  --namespace kits-hub
```

### 3. Deploy Applications

```bash
# Deploy configuration
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Deploy shell application
kubectl apply -f k8s/shell-deployment.yaml

# Deploy solution applications
kubectl apply -f k8s/solutions-deployment.yaml

# Deploy autoscaling
kubectl apply -f k8s/hpa.yaml
```

### 4. Verify Deployment

```bash
# Check pod status
kubectl get pods -n kits-hub

# Check services
kubectl get services -n kits-hub

# Check ingress
kubectl get ingress -n kits-hub

# Test health endpoints
curl https://kits-hub.com/health
curl https://kits-hub.com/inventory/health
curl https://kits-hub.com/pos/health
```

## Monitoring & Observability

### 1. Prometheus Setup

```bash
# Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi

# Apply custom monitoring rules
kubectl apply -f monitoring/prometheus.yml
kubectl apply -f monitoring/alert_rules.yml
```

### 2. Grafana Dashboards

```bash
# Import dashboards
kubectl apply -f monitoring/grafana/dashboards/
kubectl apply -f monitoring/grafana/configmaps/
```

### 3. Log Aggregation

```bash
# Install ELK Stack
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch \
  --namespace logging \
  --create-namespace

helm install kibana elastic/kibana \
  --namespace logging \
  --create-namespace

helm install logstash elastic/logstash \
  --namespace logging \
  --create-namespace
```

### 4. Health Monitoring

```bash
# Set up health check monitoring
kubectl apply -f monitoring/health-checks.yaml

# Configure alerts
kubectl apply -f monitoring/alerts.yaml
```

## Performance Optimization

### 1. CDN Configuration

```bash
# Configure Cloudflare CDN
# 1. Add domain to Cloudflare
# 2. Configure DNS records
# 3. Enable caching rules
# 4. Set up security features

# Apply CDN configuration
kubectl apply -f performance/cdn-config.yaml
```

### 2. Service Worker Deployment

```bash
# Deploy service worker
cp performance/service-worker.js shared-shell/public/
cp performance/service-worker.js solutions/*/public/

# Update manifest.json
cp performance/manifest.json shared-shell/public/
cp performance/manifest.json solutions/*/public/
```

### 3. Load Balancer Optimization

```bash
# Apply load balancer configuration
kubectl apply -f performance/load-balancer.conf

# Tune NGINX parameters
kubectl patch configmap nginx-config \
  --patch-file performance/nginx-tuning.yaml
```

### 4. Database Optimization

```sql
-- Create optimized indexes
CREATE INDEX CONCURRENTLY idx_products_tenant_id ON products(tenant_id);
CREATE INDEX CONCURRENTLY idx_sales_created_at ON sales(created_at);
CREATE INDEX CONCURRENTLY idx_customers_email ON customers(email);

-- Update PostgreSQL configuration
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
SELECT pg_reload_conf();
```

## Security Configuration

### 1. Network Security

```bash
# Apply network policies
kubectl apply -f security/network-policies.yaml

# Configure pod security policies
kubectl apply -f security/pod-security-policies.yaml
```

### 2. RBAC Setup

```bash
# Create service accounts
kubectl apply -f security/service-accounts.yaml

# Apply RBAC rules
kubectl apply -f security/rbac.yaml
```

### 3. Secrets Management

```bash
# Enable secrets encryption
kubectl patch encryptionconfig \
  --patch-file security/encryption-config.yaml

# Rotate secrets regularly
./scripts/rotate-secrets.sh
```

### 4. Security Scanning

```bash
# Run security scans
npm audit --audit-level=moderate
trivy image kits-hub/shell:latest
kubectl get pods -n kits-hub -o json | jq '.items[].spec.containers[].image' | xargs -I {} trivy image {}
```

## Maintenance & Operations

### 1. Regular Maintenance Tasks

```bash
# Daily tasks
./scripts/daily-maintenance.sh

# Weekly tasks
./scripts/weekly-maintenance.sh

# Monthly tasks
./scripts/monthly-maintenance.sh
```

### 2. Backup Procedures

```bash
# Database backup
./scripts/backup-database.sh

# Application backup
./scripts/backup-applications.sh

# Configuration backup
./scripts/backup-config.sh
```

### 3. Update Procedures

```bash
# Rolling update
kubectl set image deployment/kits-hub-shell shell=kits-hub/shell:v1.1.0 -n kits-hub

# Blue-green deployment
./scripts/blue-green-deploy.sh

# Canary deployment
./scripts/canary-deploy.sh
```

### 4. Scaling Operations

```bash
# Manual scaling
kubectl scale deployment kits-hub-shell --replicas=5 -n kits-hub

# Auto-scaling
kubectl apply -f k8s/hpa.yaml

# Cluster scaling
kubectl autoscale deployment kits-hub-shell --cpu-percent=70 --min=3 --max=10 -n kits-hub
```

## Troubleshooting

### 1. Common Issues

#### Application Not Starting
```bash
# Check pod logs
kubectl logs -f deployment/kits-hub-shell -n kits-hub

# Check events
kubectl describe pod <pod-name> -n kits-hub

# Check resources
kubectl top pods -n kits-hub
```

#### Database Connection Issues
```bash
# Test database connectivity
kubectl exec -it postgresql-0 -n kits-hub -- psql -U postgres -d kits_hub

# Check connection pool
kubectl exec -it postgresql-0 -n kits-hub -- psql -c "SELECT * FROM pg_stat_activity;"

# Check database logs
kubectl logs -f postgresql-0 -n kits-hub
```

#### Performance Issues
```bash
# Check resource usage
kubectl top nodes
kubectl top pods -n kits-hub

# Check network latency
kubectl exec -it <pod-name> -n kits-hub -- ping kits-hub.com

# Check load balancer
kubectl get ingress -n kits-hub -o yaml
```

### 2. Debugging Tools

```bash
# Port forwarding
kubectl port-forward service/kits-hub-shell-service 8080:80 -n kits-hub

# Exec into pod
kubectl exec -it <pod-name> -n kits-hub -- /bin/bash

# Network debugging
kubectl exec -it <pod-name> -n kits-hub -- nslookup kits-hub.com
```

### 3. Log Analysis

```bash
# View application logs
kubectl logs -f deployment/kits-hub-shell -n kits-hub --tail=100

# View system logs
kubectl logs -f -n kube-system

# View ingress logs
kubectl logs -f -n ingress-nginx
```

## Disaster Recovery

### 1. Backup Restoration

```bash
# Restore database
./scripts/restore-database.sh backup-2024-01-01.sql

# Restore applications
./scripts/restore-applications.sh backup-2024-01-01.tar

# Restore configuration
./scripts/restore-config.sh backup-2024-01-01.yaml
```

### 2. Cluster Recovery

```bash
# Recreate cluster
./scripts/recreate-cluster.sh

# Restore from backup
./scripts/restore-cluster.sh

# Verify restoration
./scripts/verify-restoration.sh
```

### 3. Emergency Procedures

```bash
# Emergency shutdown
./scripts/emergency-shutdown.sh

# Emergency startup
./scripts/emergency-startup.sh

# Failover procedures
./scripts/failover-procedures.sh
```

## Performance Benchmarks

### Target Metrics

- **Page Load Time**: < 3 seconds
- **First Contentful Paint**: < 1.5 seconds
- **Time to Interactive**: < 5 seconds
- **API Response Time**: < 200ms (95th percentile)
- **Database Query Time**: < 100ms (95th percentile)
- **Cache Hit Rate**: > 90%
- **Uptime**: > 99.9%

### Monitoring Thresholds

```yaml
# Performance alerts
- alert: HighResponseTime
  expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
  for: 5m
  
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
  for: 2m
  
- alert: LowCacheHitRate
  expr: cache_hit_rate < 0.9
  for: 10m
```

## Security Checklist

### Pre-Deployment

- [ ] SSL certificates configured and valid
- [ ] Security headers implemented
- [ ] Network policies applied
- [ ] RBAC configured
- [ ] Secrets encrypted
- [ ] Vulnerability scans passed
- [ ] Access control implemented
- [ ] Audit logging enabled

### Post-Deployment

- [ ] Monitor security alerts
- [ ] Review access logs
- [ ] Update dependencies regularly
- [ ] Perform security audits
- [ ] Test incident response
- [ ] Update documentation

## Support & Escalation

### Level 1 Support

- Basic troubleshooting
- Log analysis
- Performance monitoring
- User issues

### Level 2 Support

- Advanced debugging
- Infrastructure issues
- Security incidents
- Performance optimization

### Level 3 Support

- Architecture changes
- Major incidents
- Disaster recovery
- Strategic planning

### Contact Information

- **Emergency**: emergency@kits-hub.com
- **Support**: support@kits-hub.com
- **DevOps**: devops@kits-hub.com
- **Security**: security@kits-hub.com

## Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Security Guide](./SECURITY_GUIDE.md)
- [Performance Guide](./PERFORMANCE_GUIDE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-01 | Initial production deployment |
| 1.1.0 | 2024-02-01 | Added monitoring enhancements |
| 1.2.0 | 2024-03-01 | Performance optimizations |
| 1.3.0 | 2024-04-01 | Security improvements |

---

**Note**: This guide is regularly updated. Always refer to the latest version before performing deployments.
