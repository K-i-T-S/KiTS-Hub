#!/bin/bash

# KiTS Hub Disaster Recovery Script
# This script performs disaster recovery procedures for KiTS Hub

set -euo pipefail

# Configuration
RECOVERY_DATE="${1:-$(date +%Y%m%d)}"
S3_BUCKET="kits-hub-backups"
AWS_REGION="us-east-1"
LOCAL_RECOVERY_DIR="/tmp/kits-hub-recovery-${RECOVERY_DATE}"
LOG_FILE="/var/log/kits-hub-recovery.log"

# Database Configuration
DB_HOST="${RDS_ENDPOINT:-localhost:5432}"
DB_NAME="kits_hub"
DB_USER="kits_user"
DB_PASSWORD="${POSTGRES_PASSWORD}"

# Redis Configuration
REDIS_HOST="${REDIS_ENDPOINT:-localhost:6379}"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "ERROR: $1"
    send_notification "FAILED" "Disaster recovery failed: $1"
    exit 1
}

# Send notification
send_notification() {
    local status=$1
    local message=$2
    
    if [ -n "${SLACK_WEBHOOK:-}" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"KiTS Hub Recovery $status: $message\"}" \
            "$SLACK_WEBHOOK" || log "Warning: Failed to send Slack notification"
    fi
    
    if [ -n "${EMAIL_TO:-}" ]; then
        echo "$message" | mail -s "KiTS Hub Recovery $status" "$EMAIL_TO" || log "Warning: Failed to send email notification"
    fi
}

# Download backup from S3
download_backup() {
    local backup_date=$1
    log "Downloading backup from S3 for date: $backup_date"
    
    mkdir -p "$LOCAL_RECOVERY_DIR"
    
    # List available backups
    local available_backups=$(aws s3 ls "s3://$S3_BUCKET/" --recursive | grep "$backup_date" | awk '{print $4}')
    
    if [ -z "$available_backups" ]; then
        error_exit "No backups found for date: $backup_date"
    fi
    
    log "Available backups found:"
    echo "$available_backups" | tee -a "$LOG_FILE"
    
    # Download all backup files
    echo "$available_backups" | while read -r backup_file; do
        log "Downloading: $backup_file"
        aws s3 cp "s3://$S3_BUCKET/$backup_file" "$LOCAL_RECOVERY_DIR/" --region "$AWS_REGION" || error_exit "Failed to download $backup_file"
    done
    
    log "Backup download completed"
}

# Verify backup integrity
verify_backup_integrity() {
    log "Verifying backup integrity..."
    
    # Verify checksums
    find "$LOCAL_RECOVERY_DIR" -name "*.sha256" | while read -r checksum_file; do
        log "Verifying: $checksum_file"
        sha256sum -c "$checksum_file" || error_exit "Checksum verification failed for $checksum_file"
    done
    
    log "Backup integrity verification completed"
}

# Stop services
stop_services() {
    log "Stopping KiTS Hub services..."
    
    # Stop application services
    if command -v kubectl >/dev/null 2>&1; then
        kubectl scale deployment --replicas=0 --all -n kits-hub || log "Warning: Failed to scale down deployments"
        kubectl wait --for=delete pod --all -n kits-hub --timeout=300s || log "Warning: Pods did not terminate within timeout"
    fi
    
    # Stop database if needed
    # Note: For RDS, we don't stop the service, just restore the data
    
    # Stop Redis if needed
    if command -v redis-cli >/dev/null 2>&1; then
        redis-cli -h "$REDIS_HOST" SHUTDOWN NOSAVE || log "Warning: Failed to shutdown Redis"
    fi
    
    log "Services stopped"
}

# Restore database
restore_database() {
    log "Starting database restore..."
    
    local db_backup_file=$(find "$LOCAL_RECOVERY_DIR" -name "database_*.sql" | head -1)
    
    if [ ! -f "$db_backup_file" ]; then
        error_exit "Database backup file not found"
    fi
    
    log "Using database backup: $db_backup_file"
    
    # Create new database (if needed)
    PGPASSWORD="$DB_PASSWORD" createdb -h "$DB_HOST" -U "$DB_USER" "${DB_NAME}_restore" 2>/dev/null || true
    
    # Restore database
    log "Restoring database..."
    PGPASSWORD="$DB_PASSWORD" pg_restore \
        -h "$DB_HOST" \
        -U "$DB_USER" \
        -d "${DB_NAME}_restore" \
        --no-password \
        --verbose \
        --clean \
        --if-exists \
        --exit-on-error \
        "$db_backup_file" || error_exit "Database restore failed"
    
    # Verify restore
    log "Verifying database restore..."
    local table_count=$(PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -U "$DB_USER" \
        -d "${DB_NAME}_restore" \
        -t \
        -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
    
    if [ "$table_count" -eq 0 ]; then
        error_exit "Database restore verification failed - no tables found"
    fi
    
    log "Database restore completed. Tables restored: $table_count"
    
    # Switch to restored database (optional, requires manual intervention)
    log "WARNING: Database restored to ${DB_NAME}_restore. Manual intervention required to switch to production."
}

# Restore Redis
restore_redis() {
    log "Starting Redis restore..."
    
    local redis_backup_file=$(find "$LOCAL_RECOVERY_DIR" -name "redis_*.rdb" | head -1)
    
    if [ ! -f "$redis_backup_file" ]; then
        error_exit "Redis backup file not found"
    fi
    
    log "Using Redis backup: $redis_backup_file"
    
    # Stop Redis service
    if systemctl is-active --quiet redis; then
        systemctl stop redis || error_exit "Failed to stop Redis service"
    fi
    
    # Backup current Redis data
    local redis_data_dir="/var/lib/redis"
    if [ -d "$redis_data_dir" ]; then
        mv "$redis_data_dir/dump.rdb" "$redis_data_dir/dump.rdb.backup.$(date +%s)" || log "Warning: Failed to backup current Redis data"
    fi
    
    # Restore Redis data
    cp "$redis_backup_file" "$redis_data_dir/dump.rdb" || error_exit "Failed to restore Redis data"
    
    # Set proper permissions
    chown redis:redis "$redis_data_dir/dump.rdb" || error_exit "Failed to set Redis file permissions"
    
    # Start Redis service
    systemctl start redis || error_exit "Failed to start Redis service"
    
    # Verify Redis
    sleep 5
    if ! redis-cli -h "$REDIS_HOST" ping; then
        error_exit "Redis is not responding after restore"
    fi
    
    log "Redis restore completed"
}

# Restore application data
restore_application_data() {
    log "Starting application data restore..."
    
    local app_backup_dir=$(find "$LOCAL_RECOVERY_DIR" -name "application_data" -type d | head -1)
    
    if [ ! -d "$app_backup_dir" ]; then
        error_exit "Application data backup directory not found"
    fi
    
    # Restore uploaded files
    local uploads_backup=$(find "$app_backup_dir" -name "uploads_*.tar.gz" | head -1)
    if [ -f "$uploads_backup" ]; then
        log "Restoring uploaded files..."
        rm -rf /var/kits-hub/uploads || true
        mkdir -p /var/kits-hub/uploads
        tar -xzf "$uploads_backup" -C "/var/kits-hub/" || error_exit "Failed to restore uploaded files"
        log "Uploaded files restored"
    fi
    
    # Restore configuration files
    if [ -d "$app_backup_dir/config" ]; then
        log "Restoring configuration files..."
        cp -r "$app_backup_dir/config/"* /etc/kits-hub/ || error_exit "Failed to restore configuration files"
        log "Configuration files restored"
    fi
    
    # Restore SSL certificates
    local ssl_backup=$(find "$app_backup_dir" -name "ssl_*.tar.gz" | head -1)
    if [ -f "$ssl_backup" ]; then
        log "Restoring SSL certificates..."
        rm -rf /etc/nginx/ssl || true
        mkdir -p /etc/nginx/ssl
        tar -xzf "$ssl_backup" -C "/etc/nginx/" || error_exit "Failed to restore SSL certificates"
        log "SSL certificates restored"
    fi
    
    log "Application data restore completed"
}

# Restore Kubernetes manifests
restore_kubernetes_manifests() {
    log "Starting Kubernetes manifests restore..."
    
    local k8s_backup_dir=$(find "$LOCAL_RECOVERY_DIR" -name "kubernetes" -type d | head -1)
    
    if [ ! -d "$k8s_backup_dir" ]; then
        error_exit "Kubernetes backup directory not found"
    fi
    
    # Apply manifests
    if [ -f "$k8s_backup_dir/all_resources.yaml" ]; then
        log "Applying Kubernetes manifests..."
        kubectl apply -f "$k8s_backup_dir/all_resources.yaml" -n kits-hub || error_exit "Failed to apply Kubernetes manifests"
    fi
    
    log "Kubernetes manifests restore completed"
}

# Start services
start_services() {
    log "Starting KiTS Hub services..."
    
    # Start Redis if not running
    if ! systemctl is-active --quiet redis; then
        systemctl start redis || error_exit "Failed to start Redis"
    fi
    
    # Start application services
    if command -v kubectl >/dev/null 2>&1; then
        kubectl scale deployment --replicas=3 --all -n kits-hub || error_exit "Failed to scale up deployments"
        kubectl wait --for=condition=available deployment --all -n kits-hub --timeout=600s || error_exit "Deployments did not become available"
    fi
    
    # Restart nginx
    if systemctl is-active --quiet nginx; then
        systemctl reload nginx || error_exit "Failed to reload nginx"
    fi
    
    log "Services started"
}

# Perform health checks
health_checks() {
    log "Performing health checks..."
    
    # Database health check
    log "Checking database connectivity..."
    PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -U "$DB_USER" \
        -d "${DB_NAME}_restore" \
        -c "SELECT 1;" >/dev/null || error_exit "Database health check failed"
    
    # Redis health check
    log "Checking Redis connectivity..."
    redis-cli -h "$REDIS_HOST" ping >/dev/null || error_exit "Redis health check failed"
    
    # Application health checks
    if command -v kubectl >/dev/null 2>&1; then
        log "Checking application pods..."
        kubectl get pods -n kits-hub | grep -E "(Running|Ready)" || error_exit "Application pods are not healthy"
    fi
    
    log "Health checks completed"
}

# Generate recovery report
generate_recovery_report() {
    local report_file="/tmp/kits-hub-recovery-report-${RECOVERY_DATE}.txt"
    
    cat > "$report_file" << EOF
KiTS Hub Disaster Recovery Report
=====================================
Recovery Date: $(date)
Backup Date Used: $RECOVERY_DATE
Recovery Started: $(date -r "$LOCAL_RECOVERY_DIR" '+%Y-%m-%d %H:%M:%S')
Recovery Completed: $(date '+%Y-%m-%d %H:%M:%S')

Components Restored:
- Database: $(find "$LOCAL_RECOVERY_DIR" -name "database_*.sql" | wc -l) files
- Redis: $(find "$LOCAL_RECOVERY_DIR" -name "redis_*.rdb" | wc -l) files
- Application Data: $(find "$LOCAL_RECOVERY_DIR" -name "application_data" -type d | wc -l) directories
- Kubernetes Manifests: $(find "$LOCAL_RECOVERY_DIR" -name "kubernetes" -type d | wc -l) directories

Database Information:
- Host: $DB_HOST
- Database: ${DB_NAME}_restore
- User: $DB_USER

Redis Information:
- Host: $REDIS_HOST

Next Steps:
1. Verify application functionality
2. Update database connection strings to use restored database
3. Monitor system performance
4. Update documentation

Contact Information:
- Support Team: support@kits-hub.com
- Emergency Contact: emergency@kits-hub.com
EOF
    
    log "Recovery report generated: $report_file"
    
    # Send report via email
    if [ -n "${EMAIL_TO:-}" ]; then
        cat "$report_file" | mail -s "KiTS Hub Disaster Recovery Report - $RECOVERY_DATE" "$EMAIL_TO"
    fi
}

# Main recovery function
main() {
    local backup_date=${1:-$(date +%Y%m%d)}
    
    log "Starting KiTS Hub disaster recovery process for backup date: $backup_date"
    
    # Start timing
    local start_time=$(date +%s)
    
    # Download backup
    download_backup "$backup_date"
    
    # Verify backup integrity
    verify_backup_integrity
    
    # Stop services
    stop_services
    
    # Restore components
    restore_database
    restore_redis
    restore_application_data
    restore_kubernetes_manifests
    
    # Start services
    start_services
    
    # Perform health checks
    health_checks
    
    # Calculate duration
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local duration_formatted=$(printf '%02d:%02d:%02d' $((duration/3600)) $((duration%3600/60)) $((duration%60)))
    
    log "Disaster recovery completed successfully in $duration_formatted"
    
    # Generate recovery report
    generate_recovery_report
    
    # Send success notification
    send_notification "SUCCESS" "Disaster recovery completed successfully in $duration_formatted"
    
    # Cleanup
    rm -rf "$LOCAL_RECOVERY_DIR"
    
    log "Disaster recovery process completed successfully"
}

# Error handling trap
trap 'error_exit "Script interrupted or failed"' ERR

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    error_exit "This script must be run as root"
fi

# Run main function
main "$@"
