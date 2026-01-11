#!/bin/bash

echo "🚀 KiTS Hub Complete Demo Setup"
echo "================================"

# Clean up any existing processes
echo "🧹 Cleaning up..."
pkill -f "vite preview" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Start each solution on different ports
echo "📦 Starting Inventory Management (Port 4173)..."
cd solutions/inventory-management
npm run preview &
sleep 3

echo "🛒 Starting Point of Sale (Port 4174)..."
cd ../point-of-sale
npm run preview &
sleep 3

echo "👥 Starting CRM System (Port 4175)..."
cd ../crm-system
npm run preview &
sleep 3

echo "👔 Starting HR Management (Port 4176)..."
cd ../hr-management
npm run preview &
sleep 3

echo "💰 Starting Accounting System (Port 4177)..."
cd ../accounting-system
npm run preview &
sleep 3

echo "📊 Starting Analytics Dashboard (Port 4178)..."
cd ../analytics-dashboard
npm run preview &
sleep 3

echo ""
echo "🎯 DEMO URLs:"
echo "================================"
echo "📦 Inventory Management: http://localhost:4173/"
echo "🛒 Point of Sale: http://localhost:4174/"
echo "👥 CRM System: http://localhost:4175/"
echo "👔 HR Management: http://localhost:4176/"
echo "💰 Accounting System: http://localhost:4177/"
echo "📊 Analytics Dashboard: http://localhost:4178/"
echo ""
echo "✅ All services started! Test each URL above."
echo ""
echo "🔍 What to test:"
echo "- Navigation and layout"
echo "- Component rendering"
echo "- Responsive design (resize browser)"
echo "- Mock data functionality"
echo "- Arabic/RTL support"
echo ""
echo "⏹️  To stop: pkill -f 'vite preview'"
