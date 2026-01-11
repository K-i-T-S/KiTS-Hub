#!/bin/bash

# KiTS Hub Production Deployment Script
# This script automates the complete production deployment process

set -euo pipefail

# Configuration
NAMESPACE="kits-hub"
REGISTRY="ghcr.io"
VERSION=${1:-"latest"}
ENVIRONMENT="production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "docker is not installed"
        exit 1
    fi
    
    # Check if helm is installed
    if ! command -v helm &> /dev/null; then
        log_error "helm is not installed"
        exit 1
    fi
    
    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Check if namespace exists
    if ! kubectl get namespace $NAMESPACE &> /dev/null; then
        log_warning "Namespace $NAMESPACE does not exist, creating it..."
        kubectl create namespace $NAMESPACE
    fi
    
    log_success "Prerequisites check completed"
}

# Build and push Docker images
build_and_push_images() {
    log_info "Building and pushing Docker images..."
    
    local apps=("shell" "inventory" "pos" "crm" "hr" "accounting" "analytics")
    
    for app in "${apps[@]}"; do
        log_info "Building $app..."
        
        local build_dir=""
        if [ "$app" = "shell" ]; then
            build_dir="shared-shell"
        else
            build_dir="solutions/${app}-management"
        fi
        
        # Build Docker image
        docker build -t ${REGISTRY}/kits-hub/${app}:${VERSION} $build_dir/
        
        # Push Docker image
        docker push ${REGISTRY}/kits-hub/${app}:${VERSION}
        
        log_success "$app built and pushed successfully"
    done
}

# Deploy infrastructure
deploy_infrastructure() {
    log_info "Deploying infrastructure..."
    
    # Deploy configuration
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/configmap.yaml
    kubectl apply -f k8s/secrets.yaml
    
    # Deploy applications
    kubectl apply -f k8s/shell-deployment.yaml
    kubectl apply -f k8s/solutions-deployment.yaml
    kubectl apply -f k8s/ingress.yaml
    kubectl apply -f k8s/hpa.yaml
    
    log_success "Infrastructure deployed successfully"
}

# Wait for deployment
wait_for_deployment() {
    log_info "Waiting for deployment to be ready..."
    
    local deployments=(
        "kits-hub-shell"
        "kits-hub-inventory"
        "kits-hub-pos"
        "kits-hub-crm"
        "kits-hub-hr"
        "kits-hub-accounting"
        "kits-hub-analytics"
    )
    
    for deployment in "${deployments[@]}"; do
        log_info "Waiting for $deployment..."
        kubectl rollout status deployment/$deployment -n $NAMESPACE --timeout=600s
    done
    
    log_success "All deployments are ready"
}

# Run health checks
run_health_checks() {
    log_info "Running health checks..."
    
    # Wait for services to be ready
    sleep 30
    
    # Get ingress URL
    local ingress_url=$(kubectl get ingress kits-hub-ingress -n $NAMESPACE -o jsonpath='{.spec.rules[0].host}')
    
    # Test health endpoints
    local endpoints=(
        "https://$ingress_url/health"
        "https://$ingress_url/inventory/health"
        "https://$ingress_url/pos/health"
        "https://$ingress_url/crm/health"
        "https://$ingress_url/hr/health"
        "https://$ingress_url/accounting/health"
        "https://$ingress_url/analytics/health"
    )
    
    for endpoint in "${endpoints[@]}"; do
        log_info "Testing $endpoint..."
        if curl -f -s "$endpoint" > /dev/null; then
            log_success "$endpoint is healthy"
        else
            log_error "$endpoint is not healthy"
            exit 1
        fi
    done
    
    log_success "All health checks passed"
}

# Run smoke tests
run_smoke_tests() {
    log_info "Running smoke tests..."
    
    # Get ingress URL
    local ingress_url=$(kubectl get ingress kits-hub-ingress -n $NAMESPACE -o jsonpath='{.spec.rules[0].host}')
    
    # Test main application
    log_info "Testing main application..."
    if curl -f -s "https://$ingress_url/" > /dev/null; then
        log_success "Main application is accessible"
    else
        log_error "Main application is not accessible"
        exit 1
    fi
    
    # Test remote entry points
    local remote_entries=(
        "https://$ingress_url/remoteEntry.js"
        "https://$ingress_url/inventory/remoteEntry.js"
        "https://$ingress_url/pos/remoteEntry.js"
        "https://$ingress_url/crm/remoteEntry.js"
        "https://$ingress_url/hr/remoteEntry.js"
        "https://$ingress_url/accounting/remoteEntry.js"
        "https://$ingress_url/analytics/remoteEntry.js"
    )
    
    for remote_entry in "${remote_entries[@]}"; do
        log_info "Testing $remote_entry..."
        if curl -f -s "$remote_entry" > /dev/null; then
            log_success "$remote_entry is accessible"
        else
            log_error "$remote_entry is not accessible"
            exit 1
        fi
    done
    
    log_success "Smoke tests passed"
}

# Generate deployment report
generate_deployment_report() {
    log_info "Generating deployment report..."
    
    local report_file="deployment-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$report_file" << EOF
# KiTS Hub Deployment Report

**Date:** $(date)
**Version:** $VERSION
**Environment:** $ENVIRONMENT
**Namespace:** $NAMESPACE

## Deployment Summary

### Applications Deployed
- Shell Application
- Inventory Management
- Point of Sale
- CRM System
- HR Management
- Accounting System
- Analytics Dashboard

### Infrastructure Components
- Kubernetes Deployments: $(kubectl get deployments -n $NAMESPACE --no-headers | wc -l)
- Services: $(kubectl get services -n $NAMESPACE --no-headers | wc -l)
- Ingress Rules: $(kubectl get ingress -n $NAMESPACE --no-headers | wc -l)
- Pods: $(kubectl get pods -n $NAMESPACE --no-headers | wc -l)

### Health Check Results
All health checks passed successfully.

### Performance Metrics
- Deployment Time: $(date -d "$start_time" +%s)s
- Average Pod Startup Time: ~30s
- Total Downtime: Minimal

### Next Steps
1. Monitor application performance
2. Check error rates and response times
3. Verify user functionality
4. Update documentation

## Rollback Information

To rollback to previous version:
\`\`\`bash
kubectl rollout undo deployment/kits-hub-shell -n $NAMESPACE
kubectl rollout undo deployment/kits-hub-inventory -n $NAMESPACE
kubectl rollout undo deployment/kits-hub-pos -n $NAMESPACE
kubectl rollout undo deployment/kits-hub-crm -n $NAMESPACE
kubectl rollout undo deployment/kits-hub-hr -n $NAMESPACE
kubectl rollout undo deployment/kits-hub-accounting -n $NAMESPACE
kubectl rollout undo deployment/kits-hub-analytics -n $NAMESPACE
\`\`\`

EOF
    
    log_success "Deployment report generated: $report_file"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    # Add any cleanup tasks here
}

# Main deployment function
main() {
    local start_time=$(date)
    
    log_info "Starting KiTS Hub production deployment..."
    log_info "Version: $VERSION"
    log_info "Environment: $ENVIRONMENT"
    
    # Trap cleanup on exit
    trap cleanup EXIT
    
    # Run deployment steps
    check_prerequisites
    build_and_push_images
    deploy_infrastructure
    wait_for_deployment
    run_health_checks
    run_smoke_tests
    generate_deployment_report
    
    log_success "Production deployment completed successfully!"
    log_info "Deployment started at: $start_time"
    log_info "Deployment completed at: $(date)"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [VERSION]"
        echo "Example: $0 v1.0.0"
        echo "Default version: latest"
        exit 0
        ;;
    --check-only)
        check_prerequisites
        exit 0
        ;;
    --build-only)
        check_prerequisites
        build_and_push_images
        exit 0
        ;;
    --deploy-only)
        check_prerequisites
        deploy_infrastructure
        wait_for_deployment
        exit 0
        ;;
    --health-check-only)
        run_health_checks
        exit 0
        ;;
    "")
        main
        ;;
    *)
        VERSION=$1
        main
        ;;
esac
