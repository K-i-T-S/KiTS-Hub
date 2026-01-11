#!/bin/bash

echo "Stopping all KiTS Hub remote services..."

# Stop services using saved PIDs
if [ -f /tmp/kits-crm.pid ]; then
    CRM_PID=$(cat /tmp/kits-crm.pid)
    kill $CRM_PID 2>/dev/null && echo "✅ CRM System stopped (PID: $CRM_PID)"
    rm /tmp/kits-crm.pid
fi

if [ -f /tmp/kits-hr.pid ]; then
    HR_PID=$(cat /tmp/kits-hr.pid)
    kill $HR_PID 2>/dev/null && echo "✅ HR Management stopped (PID: $HR_PID)"
    rm /tmp/kits-hr.pid
fi

if [ -f /tmp/kits-accounting.pid ]; then
    ACCOUNTING_PID=$(cat /tmp/kits-accounting.pid)
    kill $ACCOUNTING_PID 2>/dev/null && echo "✅ Accounting System stopped (PID: $ACCOUNTING_PID)"
    rm /tmp/kits-accounting.pid
fi

if [ -f /tmp/kits-analytics.pid ]; then
    ANALYTICS_PID=$(cat /tmp/kits-analytics.pid)
    kill $ANALYTICS_PID 2>/dev/null && echo "✅ Analytics Dashboard stopped (PID: $ANALYTICS_PID)"
    rm /tmp/kits-analytics.pid
fi

# Also kill any remaining webpack processes on these ports
echo "🧹 Cleaning up any remaining processes..."
pkill -f "webpack.*4179" 2>/dev/null
pkill -f "webpack.*4180" 2>/dev/null
pkill -f "webpack.*4181" 2>/dev/null
pkill -f "webpack.*4182" 2>/dev/null

echo "✅ All remote services stopped!"
