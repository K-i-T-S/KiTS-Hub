#!/bin/bash

echo "🚀 Starting complete KiTS Hub micro-frontend architecture..."

# Kill any existing processes first
echo "🧹 Cleaning up existing processes..."
pkill -f "webpack.*3000" 2>/dev/null
pkill -f "webpack.*4177" 2>/dev/null
pkill -f "webpack.*4178" 2>/dev/null
pkill -f "webpack.*4179" 2>/dev/null
pkill -f "webpack.*4180" 2>/dev/null
pkill -f "webpack.*4181" 2>/dev/null
pkill -f "webpack.*4182" 2>/dev/null
sleep 2

# Start Shell on port 3000
echo "🏠 Starting Shell on port 3000..."
cd /home/casio699/projects/kits-hub/shared-shell
npm run mf > /dev/null 2>&1 &
SHELL_PID=$!
echo "Shell started with PID: $SHELL_PID"

# Start Inventory Management on port 4177
echo "📦 Starting Inventory Management on port 4177..."
cd /home/casio699/projects/kits-hub/solutions/inventory-management
npm run preview > /dev/null 2>&1 &
INVENTORY_PID=$!
echo "Inventory Management started with PID: $INVENTORY_PID"

# Start Point of Sale on port 4178
echo "💳 Starting Point of Sale on port 4178..."
cd /home/casio699/projects/kits-hub/solutions/point-of-sale
npm run preview > /dev/null 2>&1 &
POS_PID=$!
echo "Point of Sale started with PID: $POS_PID"

# Start CRM System on port 4179
echo "👥 Starting CRM System on port 4179..."
cd /home/casio699/projects/kits-hub/solutions/crm-system
npm run preview > /dev/null 2>&1 &
CRM_PID=$!
echo "CRM System started with PID: $CRM_PID"

# Start HR Management on port 4180
echo "👔 Starting HR Management on port 4180..."
cd /home/casio699/projects/kits-hub/solutions/hr-management
npm run preview > /dev/null 2>&1 &
HR_PID=$!
echo "HR Management started with PID: $HR_PID"

# Start Accounting System on port 4181
echo "📊 Starting Accounting System on port 4181..."
cd /home/casio699/projects/kits-hub/solutions/accounting-system
npm run preview > /dev/null 2>&1 &
ACCOUNTING_PID=$!
echo "Accounting System started with PID: $ACCOUNTING_PID"

# Start Analytics Dashboard on port 4182
echo "📈 Starting Analytics Dashboard on port 4182..."
cd /home/casio699/projects/kits-hub/solutions/analytics-dashboard
npm run preview > /dev/null 2>&1 &
ANALYTICS_PID=$!
echo "Analytics Dashboard started with PID: $ANALYTICS_PID"

# Save all PIDs for cleanup
echo "$SHELL_PID" > /tmp/kits-shell.pid
echo "$INVENTORY_PID" > /tmp/kits-inventory.pid
echo "$POS_PID" > /tmp/kits-pos.pid
echo "$CRM_PID" > /tmp/kits-crm.pid
echo "$HR_PID" > /tmp/kits-hr.pid
echo "$ACCOUNTING_PID" > /tmp/kits-accounting.pid
echo "$ANALYTICS_PID" > /tmp/kits-analytics.pid

echo ""
echo "✅ Complete KiTS Hub micro-frontend architecture started!"
echo ""
echo "📊 Service Status:"
echo "   🏠 Shell (3000): PID $SHELL_PID"
echo "   📦 Inventory (4177): PID $INVENTORY_PID"
echo "   💳 Point of Sale (4178): PID $POS_PID"
echo "   👥 CRM System (4179): PID $CRM_PID"
echo "   👔 HR Management (4180): PID $HR_PID"
echo "   📊 Accounting (4181): PID $ACCOUNTING_PID"
echo "   📈 Analytics (4182): PID $ANALYTICS_PID"
echo ""
echo "🌐 Main Application: http://localhost:3000"
echo "🔧 To stop all services: ./scripts/stop-all-services.sh"
echo ""

# Wait for services to start
echo "⏳ Waiting for services to initialize..."
sleep 5

# Check service health
echo "🔍 Checking service health..."
for port in 3000 4177 4178 4179 4180 4181 4182; do
    service_name=""
    case $port in
        3000) service_name="Shell" ;;
        4177) service_name="Inventory" ;;
        4178) service_name="Point of Sale" ;;
        4179) service_name="CRM System" ;;
        4180) service_name="HR Management" ;;
        4181) service_name="Accounting" ;;
        4182) service_name="Analytics" ;;
    esac
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$port | grep -q "200\|404"; then
        echo "   ✅ $service_name (port $port): Responding"
    else
        echo "   ⏳ $service_name (port $port): Starting up..."
    fi
done

echo ""
echo "🎉 KiTS Hub is ready! Visit http://localhost:3000 to see the micro-frontend architecture in action!"
