#!/bin/bash
# Build extension
# Usage: ./build-extension.sh

cd "$(dirname "$0")/extension"

echo "🔨 Building Extension..."
echo ""

npm install 2>/dev/null

echo "Building..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Extension built successfully!"
    echo "📁 Location: $(pwd)/dist"
    echo ""
    echo "📋 Next steps:"
    echo "1. Open Chrome: chrome://extensions"
    echo "2. Enable 'Developer mode' (top right)"
    echo "3. Click 'Load unpacked'"
    echo "4. Select the 'dist' folder"
else
    echo ""
    echo "❌ Build failed. Check errors above."
    exit 1
fi
