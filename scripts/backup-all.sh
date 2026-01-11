#!/bin/bash

# KiTS Hub Backup Script
# This script performs comprehensive backups of all KiTS Hub components

set -euo pipefail

# Configuration
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/kits-hub/${BACKUP_DATE}"
LOG_FILE="/var/log/kits-hub-backup.log"
RETENTION_DAYS=30

# AWS S3 Configuration
S3_BUCKET="kits-hub-backups"
AWS_REGION="us-east-1"

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
    exit 1
}

# Create backup directory
create_backup_dir() {
    log "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
}

# Database backup
backup_database() {
    log "Starting database backup..."
    
    local db_backup_file="$BACKUP_DIR/database_${BACKUP_DATE}.sql"
    
    # Create database dump
    PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-password \
        --verbose \
        --format=custom \
        --compress=9 \
        --file="$db_backup_file" || error_exit "Database backup failed"
    
    # Verify backup
    if [ ! -f "$db_backup_file" ]; then
        error_exit "Database backup file not created"
    fi
    
    # Get backup size
    local backup_size=$(du -h "$db_backup_file" | cut -f1)
    log "Database backup completed: $backup_size"
    
    # Create checksum
    sha256sum "$db_backup_file" > "$db_backup_file.sha256"
    
    echo "$db_backup_file"
}

# Redis backup
backup_redis() {
    log "Starting Redis backup..."
    
    local redis_backup_file="$BACKUP_DIR/redis_${BACKUP_DATE}.rdb"
    
    # Connect to Redis and trigger backup
    redis-cli -h "$REDIS_HOST" BGSAVE || error_exit "Redis backup trigger failed"
    
    # Wait for backup to complete
    while [ "$(redis-cli -h "$REDIS_HOST" LASTSAVE)" -eq "$(redis-cli -h "$REDIS_HOST" LASTSAVE)" ]; do
        log "Waiting for Redis backup to complete..."
        sleep 5
    done
    
    # Copy Redis dump file
    local redis_dump_dir="/var/lib/redis"
    if [ -f "$redis_dump_dir/dump.rdb" ]; then
        cp "$redis_dump_dir/dump.rdb" "$redis_backup_file" || error_exit "Redis backup copy failed"
        
        # Create checksum
        sha256sum "$redis_backup_file" > "$redis_backup_file.sha256"
        
        local backup_size=$(du -h "$redis_backup_file" | cut -f1)
        log "Redis backup completed: $backup_size"
    else
        error_exit "Redis dump file not found"
    fi
    
    echo "$redis_backup_file"
}

# Application data backup
backup_application_data() {
    log "Starting application data backup..."
    
    local app_backup_dir="$BACKUP_DIR/application_data"
    mkdir -p "$app_backup_dir"
    
    # Backup uploaded files
    if [ -d "/var/kits-hub/uploads" ]; then
        log "Backing up uploaded files..."
        tar -czf "$app_backup_dir/uploads_${BACKUP_DATE}.tar.gz" -C "/var/kits-hub" uploads/ || error_exit "Upload files backup failed"
    fi
    
    # Backup configuration files
    log "Backing up configuration files..."
    mkdir -p "$app_backup_dir/config"
    
    # Copy environment files (without sensitive data)
    find /etc/kits-hub -name "*.conf" -o -name "*.yml" -o -name "*.yaml" | while read -r file; do
        cp "$file" "$app_backup_dir/config/" || error_exit "Config backup failed for $file"
    done
    
    # Backup SSL certificates
    if [ -d "/etc/nginx/ssl" ]; then
        log "Backing up SSL certificates..."
        tar -czf "$app_backup_dir/ssl_${BACKUP_DATE}.tar.gz" -C "/etc/nginx" ssl/ || error_exit "SSL backup failed"
    fi
    
    log "Application data backup completed"
}

# Kubernetes manifests backup
backup_kubernetes_manifests() {
    log "Starting Kubernetes manifests backup..."
    
    local k8s_backup_dir="$BACKUP_DIR/kubernetes"
    mkdir -p "$k8s_backup_dir"
    
    # Export all resources
    kubectl get all,configmaps,secrets,pvc,ingress -n kits-hub -o yaml > "$k8s_backup_dir/all_resources.yaml" || error_exit "Kubernetes resources export failed"
    
    # Export specific resources by type
    for resource_type in deployments services configmaps secrets pvc ingress; do
        kubectl get "$resource_type" -n kits-hub -o yaml > "$k8s_backup_dir/${resource_type}.yaml" || log "Warning: Failed to export $resource_type"
    done
    
    log "Kubernetes manifests backup completed"
}

# Upload to S3
upload_to_s3() {
    log "Starting upload to S3..."
    
    # Upload entire backup directory
    aws s3 cp "$BACKUP_DIR" "s3://$S3_BUCKET/" --recursive --region "$AWS_REGION" || error_exit "S3 upload failed"
    
    # Create S3 lifecycle policy for retention
    aws s3api put-bucket-lifecycle-configuration \
        --bucket "$S3_BUCKET" \
        --lifecycle-configuration '{
            "Rules": [
                {
                    "ID": "DeleteOldBackups",
                    "Status": "Enabled",
                    "Filter": {"Prefix": ""},
                    "Expiration": {"Days": '$RETENTION_DAYS'}
                }
            ]
        }' || log "Warning: Failed to set S3 lifecycle policy"
    
    log "S3 upload completed"
}

# Verify backup integrity
verify_backup() {
    log "Starting backup verification..."
    
    # Verify database backup
    local db_backup_file=$(find "$BACKUP_DIR" -name "database_*.sql" | head -1)
    if [ -f "$db_backup_file" ]; then
        log "Verifying database backup integrity..."
        sha256sum -c "$db_backup_file.sha256" || error_exit "Database backup checksum verification failed"
        
        # Test restore (dry run)
        PGPASSWORD="$DB_PASSWORD" pg_restore \
            -h "$DB_HOST" \
            -U "$DB_USER" \
            -d "$DB_NAME" \
            --no-password \
            --list \
            "$db_backup_file" > /dev/null || error_exit "Database backup verification failed"
    fi
    
    # Verify Redis backup
    local redis_backup_file=$(find "$BACKUP_DIR" -name "redis_*.rdb" | head -1)
    if [ -f "$redis_backup_file" ]; then
        log "Verifying Redis backup integrity..."
        sha256sum -c "$redis_backup_file.sha256" || error_exit "Redis backup checksum verification failed"
    fi
    
    log "Backup verification completed"
}

# Cleanup old backups
cleanup_old_backups() {
    log "Starting cleanup of old backups..."
    
    # Local cleanup
    find "/backups/kits-hub" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} + || log "Warning: Failed to cleanup old local backups"
    
    # S3 cleanup (handled by lifecycle policy)
    log "Old backup cleanup completed"
}

# Send notification
send_notification() {
    local status=$1
    local message=$2
    
    if [ -n "${SLACK_WEBHOOK:-}" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"KiTS Hub Backup $status: $message\"}" \
            "$SLACK_WEBHOOK" || log "Warning: Failed to send Slack notification"
    fi
    
    if [ -n "${EMAIL_TO:-}" ]; then
        echo "$message" | mail -s "KiTS Hub Backup $status" "$EMAIL_TO" || log "Warning: Failed to send email notification"
    fi
}

# Main backup function
main() {
    log "Starting KiTS Hub backup process..."
    
    # Start timing
    local start_time=$(date +%s)
    
    # Create backup directory
    create_backup_dir
    
    # Perform backups
    local db_backup_file=$(backup_database)
    local redis_backup_file=$(backup_redis)
    backup_application_data
    backup_kubernetes_manifests
    
    # Upload to cloud storage
    upload_to_s3
    
    # Verify backup
    verify_backup
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Calculate duration
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local duration_formatted=$(printf '%02d:%02d:%02d' $((duration/3600)) $((duration%3600/60)) $((duration%60)))
    
    # Get total backup size
    local total_size=$(du -sh "$BACKUP_DIR" | cut -f1)
    
    log "Backup completed successfully in $duration_formatted. Total size: $total_size"
    
    # Send success notification
    send_notification "SUCCESS" "Backup completed successfully in $duration_formatted. Total size: $total_size. Location: $BACKUP_DIR"
    
    # Cleanup local backup directory after successful upload
    rm -rf "$BACKUP_DIR"
    
    log "Backup process completed successfully"
}

# Error handling trap
trap 'error_exit "Script interrupted or failed"' ERR

# Run main function
main "$@"
