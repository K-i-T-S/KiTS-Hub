#!/bin/bash

echo "Starting all KiTS Hub remote services..."

# Start all services in background
cd /home/casio699/projects/kits-hub/solutions/crm-system
echo "Starting CRM System on port 4179..."
npm run preview > /dev/null 2>&1 &
CRM_PID=$!
echo "CRM System started with PID: $CRM_PID"

cd /home/casio699/projects/kits-hub/solutions/hr-management
echo "Starting HR Management on port 4180..."
npm run preview > /dev/null 2>&1 &
HR_PID=$!
echo "HR Management started with PID: $HR_PID"

cd /home/casio699/projects/kits-hub/solutions/accounting-system
echo "Starting Accounting System on port 4181..."
npm run preview > /dev/null 2>&1 &
ACCOUNTING_PID=$!
echo "Accounting System started with PID: $ACCOUNTING_PID"

cd /home/casio699/projects/kits-hub/solutions/analytics-dashboard
echo "Starting Analytics Dashboard on port 4182..."
npm run preview > /dev/null 2>&1 &
ANALYTICS_PID=$!
echo "Analytics Dashboard started with PID: $ANALYTICS_PID"

# Save PIDs to file for later cleanup
echo "$CRM_PID" > /tmp/kits-crm.pid
echo "$HR_PID" > /tmp/kits-hr.pid
echo "$ACCOUNTING_PID" > /tmp/kits-accounting.pid
echo "$ANALYTICS_PID" > /tmp/kits-analytics.pid

echo ""
echo "✅ All remote services started in background!"
echo "📊 Service Status:"
echo "   - CRM System (4179): PID $CRM_PID"
echo "   - HR Management (4180): PID $HR_PID" 
echo "   - Accounting System (4181): PID $ACCOUNTING_PID"
echo "   - Analytics Dashboard (4182): PID $ANALYTICS_PID"
echo ""
echo "🔧 To stop all services: ./scripts/stop-remote-services.sh"
echo "🌐 Shell should be available at: http://localhost:3000"

# Wait a moment for services to start
sleep 3

# Check service status
echo "🔍 Checking service health..."
for port in 4179 4180 4181 4182; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/remoteEntry.js | grep -q "200\|404"; then
        echo "   ✅ Port $port: Responding"
    else
        echo "   ⏳ Port $port: Starting up..."
    fi
done

echo ""
echo "🚀 KiTS Hub micro-frontend architecture is ready!"
