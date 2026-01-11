#!/bin/bash

echo "🛑 Stopping complete KiTS Hub micro-frontend architecture..."

# Stop all services using saved PIDs
services=("shell" "inventory" "pos" "crm" "hr" "accounting" "analytics")
ports=("3000" "4177" "4178" "4179" "4180" "4181" "4182")

for i in "${!services[@]}"; do
    service=${services[$i]}
    pid_file="/tmp/kits-$service.pid"
    
    if [ -f $pid_file ]; then
        PID=$(cat $pid_file)
        kill $PID 2>/dev/null && echo "✅ ${service^} stopped (PID: $PID)"
        rm $pid_file
    fi
done

# Also kill any remaining webpack processes
echo "🧹 Cleaning up any remaining processes..."
for port in "${ports[@]}"; do
    pkill -f "webpack.*$port" 2>/dev/null
done

# Kill any remaining npm processes
pkill -f "npm.*preview" 2>/dev/null
pkill -f "npm.*mf" 2>/dev/null

echo "✅ All KiTS Hub services stopped!"
