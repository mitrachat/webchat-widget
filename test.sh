#!/bin/bash

# Script to test the webchat widget locally

echo "🚀 MitraChat Widget Local Test Environment"
echo "============================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the packages/webchat-widget directory"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    bun install
fi

echo ""
echo "📝 Testing Options:"
echo ""
echo "1. Dev Server (with HMR) - Recommended for development"
echo "   URL: http://localhost:5174/demo.html"
echo ""
echo "2. Build & Preview (production build)"
echo "   URL: http://localhost:4174/demo.html"
echo ""
echo "3. Build Only"
echo ""

read -p "Select option (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting dev server..."
        echo "📍 Open http://localhost:5174/demo.html"
        echo "✏️  Edit files in src/ and see changes instantly"
        echo ""
        bun run dev
        ;;
    2)
        echo ""
        echo "🔨 Building widget..."
        bun run build
        echo ""
        echo "🚀 Starting preview server..."
        echo "📍 Open http://localhost:4174/demo.html"
        echo ""
        bun run preview
        ;;
    3)
        echo ""
        echo "🔨 Building widget..."
        bun run build
        echo ""
        echo "✅ Build complete! Files in dist/"
        echo "📍 Open public/demo.html in a browser to test"
        echo ""
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac
