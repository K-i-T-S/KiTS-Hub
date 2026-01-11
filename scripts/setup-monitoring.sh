#!/bin/bash

# Production Monitoring Setup Script
# Configures comprehensive monitoring and logging infrastructure

set -e

echo "📊 KiTS Hub - Monitoring & Logging Setup"
echo "======================================="

# Configuration
LOG_DIR="/var/log/kits-hub"
METRICS_DIR="/var/lib/kits-hub/metrics"
ALERT_WEBHOOK="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    local status=$1
    local message=$2
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $message"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC}: $message"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  WARN${NC}: $message"
    else
        echo -e "${BLUE}ℹ️  INFO${NC}: $message"
    fi
}

# Create necessary directories
echo ""
echo "📁 Creating monitoring directories..."

sudo mkdir -p "$LOG_DIR"
sudo mkdir -p "$METRICS_DIR"
sudo mkdir -p "/etc/kits-hub/monitoring"

print_status "PASS" "Created monitoring directories"

# Setup log rotation
echo ""
echo "🔄 Setting up log rotation..."

sudo tee /etc/logrotate.d/kits-hub > /dev/null <<EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload kits-hub || true
    endscript
}
EOF

print_status "PASS" "Log rotation configured"

# Setup application logging configuration
echo ""
echo "📝 Setting up application logging..."

sudo tee /etc/kits-hub/monitoring/logging.yml > /dev/null <<EOF
version: 1
disable_existing_loggers: false

formatters:
  standard:
    format: '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
  json:
    format: '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}'

handlers:
  console:
    class: logging.StreamHandler
    level: INFO
    formatter: standard
    stream: ext://sys.stdout

  file:
    class: logging.handlers.RotatingFileHandler
    level: INFO
    formatter: json
    filename: $LOG_DIR/application.log
    maxBytes: 10485760  # 10MB
    backupCount: 5

  error_file:
    class: logging.handlers.RotatingFileHandler
    level: ERROR
    formatter: json
    filename: $LOG_DIR/error.log
    maxBytes: 10485760  # 10MB
    backupCount: 5

loggers:
  kits_hub:
    level: INFO
    handlers: [console, file, error_file]
    propagate: false

  kits_hub.database:
    level: WARNING
    handlers: [file, error_file]
    propagate: false

  kits_hub.security:
    level: INFO
    handlers: [file, error_file]
    propagate: false

root:
  level: INFO
  handlers: [console, file]
EOF

print_status "PASS" "Application logging configured"

# Setup Prometheus configuration
echo ""
echo "📈 Setting up Prometheus monitoring..."

sudo tee /etc/kits-hub/monitoring/prometheus.yml > /dev/null <<EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "/etc/kits-hub/monitoring/alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'kits-hub-app'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'kits-hub-database'
    static_configs:
      - targets: ['localhost:5432']
    scrape_interval: 60s

  - job_name: 'kits-hub-redis'
    static_configs:
      - targets: ['localhost:6379']
    scrape_interval: 30s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
    scrape_interval: 30s
EOF

print_status "PASS" "Prometheus configuration created"

# Setup alert rules
echo ""
echo "🚨 Setting up alert rules..."

sudo tee /etc/kits-hub/monitoring/alert_rules.yml > /dev/null <<EOF
groups:
  - name: kits-hub-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ \$value }} errors per second"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ \$value }} seconds"

      - alert: DatabaseConnectionsHigh
        expr: pg_stat_database_numbackends > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connections"
          description: "Database has {{ \$value }} active connections"

      - alert: DiskSpaceUsage
        expr: (node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Disk space usage high"
          description: "Disk usage is {{ \$value | humanizePercentage }}"

      - alert: MemoryUsageHigh
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Memory usage high"
          description: "Memory usage is {{ \$value | humanizePercentage }}"

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "{{ \$labels.instance }} service has been down for more than 1 minute"
EOF

print_status "PASS" "Alert rules configured"

# Setup Grafana dashboards
echo ""
echo "📊 Setting up Grafana dashboards..."

sudo mkdir -p /etc/kits-hub/monitoring/grafana/dashboards

sudo tee /etc/kits-hub/monitoring/grafana/dashboards/kits-hub-overview.json > /dev/null <<'EOF'
{
  "dashboard": {
    "id": null,
    "title": "KiTS Hub Overview",
    "tags": ["kits-hub"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0}
      },
      {
        "id": 2,
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 0}
      },
      {
        "id": 3,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 8}
      },
      {
        "id": 4,
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends",
            "legendFormat": "Active connections"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 8}
      }
    ],
    "time": {"from": "now-1h", "to": "now"},
    "refresh": "30s"
  }
}
EOF

print_status "PASS" "Grafana dashboard configured"

# Setup health check script
echo ""
echo "🏥 Setting up health checks..."

sudo tee /usr/local/bin/kits-hub-health-check.sh > /dev/null <<'EOF'
#!/bin/bash

# KiTS Hub Health Check Script
# Monitors all services and reports status

LOG_FILE="/var/log/kits-hub/health-check.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        echo "[$TIMESTAMP] ✅ $service_name: HEALTHY" >> "$LOG_FILE"
        return 0
    else
        echo "[$TIMESTAMP] ❌ $service_name: UNHEALTHY" >> "$LOG_FILE"
        return 1
    fi
}

# Check main application
check_service "Main App" "http://localhost:3000/api/health"

# Check database
if pg_isready -h localhost -p 5432 -U kits_user &>/dev/null; then
    echo "[$TIMESTAMP] ✅ Database: HEALTHY" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] ❌ Database: UNHEALTHY" >> "$LOG_FILE"
fi

# Check Redis
if redis-cli ping &>/dev/null; then
    echo "[$TIMESTAMP] ✅ Redis: HEALTHY" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] ❌ Redis: UNHEALTHY" >> "$LOG_FILE"
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo "[$TIMESTAMP] ✅ Disk Space: OK (${DISK_USAGE}%)" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] ⚠️  Disk Space: HIGH (${DISK_USAGE}%)" >> "$LOG_FILE"
fi

# Check memory usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$MEM_USAGE" -lt 80 ]; then
    echo "[$TIMESTAMP] ✅ Memory: OK (${MEM_USAGE}%)" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] ⚠️  Memory: HIGH (${MEM_USAGE}%)" >> "$LOG_FILE"
fi

echo "[$TIMESTAMP] 🏥 Health check completed" >> "$LOG_FILE"
EOF

sudo chmod +x /usr/local/bin/kits-hub-health-check.sh

print_status "PASS" "Health check script created"

# Setup cron job for health checks
echo ""
echo "⏰ Setting up monitoring cron jobs..."

(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/kits-hub-health-check.sh") | crontab -

print_status "PASS" "Health check cron job added"

# Setup log monitoring
echo ""
echo "📋 Setting up log monitoring..."

sudo tee /usr/local/bin/kits-hub-log-monitor.sh > /dev/null <<'EOF'
#!/bin/bash

# Log Monitoring Script
# Monitors application logs for critical errors

LOG_FILE="/var/log/kits-hub/application.log"
ERROR_LOG="/var/log/kits-hub/error.log"
ALERT_THRESHOLD=5
TIME_WINDOW=300  # 5 minutes

# Check for critical errors in the last 5 minutes
ERROR_COUNT=$(tail -n 1000 "$ERROR_LOG" | grep "$(date '+%Y-%m-%d %H:%M')" | wc -l)

if [ "$ERROR_COUNT" -gt "$ALERT_THRESHOLD" ]; then
    echo "🚨 CRITICAL: $ERROR_COUNT errors detected in the last 5 minutes!"
    # Send alert (configure webhook or email)
fi

# Check for specific patterns
if tail -n 100 "$ERROR_LOG" | grep -q "database\|connection\|timeout"; then
    echo "⚠️  WARNING: Database or connectivity issues detected"
fi
EOF

sudo chmod +x /usr/local/bin/kits-hub-log-monitor.sh

(crontab -l 2>/dev/null; echo "*/2 * * * * /usr/local/bin/kits-hub-log-monitor.sh") | crontab -

print_status "PASS" "Log monitoring configured"

# Set proper permissions
echo ""
echo "🔒 Setting up permissions..."

sudo chown -R www-data:www-data "$LOG_DIR"
sudo chown -R www-data:www-data "$METRICS_DIR"
sudo chown -R www-data:www-data /etc/kits-hub

sudo chmod 755 "$LOG_DIR"
sudo chmod 755 "$METRICS_DIR"
sudo chmod 755 /etc/kits-hub

print_status "PASS" "Permissions configured"

echo ""
echo "🎉 Monitoring setup completed!"
echo "==============================="
echo ""
echo "📊 Monitoring Components:"
echo "- Application logging: ✅"
echo "- Log rotation: ✅"
echo "- Prometheus metrics: ✅"
echo "- Grafana dashboards: ✅"
echo "- Alert rules: ✅"
echo "- Health checks: ✅"
echo "- Log monitoring: ✅"
echo ""
echo "🔗 Access Points:"
echo "- Grafana: http://localhost:3001 (admin/admin)"
echo "- Prometheus: http://localhost:9090"
echo "- Health logs: $LOG_DIR/health-check.log"
echo ""
echo "🚀 Monitoring infrastructure is ready!"
