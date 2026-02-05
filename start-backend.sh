#!/bin/bash
# Start backend server
# Usage: ./start-backend.sh

cd "$(dirname "$0")/backend"

echo "🚀 Starting Pet-Chat Backend..."
echo "⚠️  Make sure OPENAI_API_KEY is set:"
echo "   export OPENAI_API_KEY='sk-your-key-here'"
echo ""

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ ERROR: OPENAI_API_KEY is not set!"
    echo "Set it with: export OPENAI_API_KEY='sk-your-key'"
    exit 1
fi

npm install 2>/dev/null

echo "✅ Backend starting on http://localhost:3000"
echo "Press Ctrl+C to stop"
echo ""

node index.js
