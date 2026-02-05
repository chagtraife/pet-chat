#!/bin/bash
# Complete setup for Pet-Chat
# Usage: ./setup.sh

echo "🎉 Pet-Chat Complete Setup"
echo "============================="
echo ""

PROJECT_ROOT="$(dirname "$0")"

# Make scripts executable
chmod +x "$PROJECT_ROOT/start-backend.sh"
chmod +x "$PROJECT_ROOT/start-pose-detection.sh"
chmod +x "$PROJECT_ROOT/build-extension.sh"

echo "✅ Making scripts executable"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed. Please install Node.js first."
    exit 1
fi
echo "✅ Node.js found: $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not installed. Please install npm first."
    exit 1
fi
echo "✅ npm found: $(npm -v)"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not installed. Please install Python3 first."
    exit 1
fi
echo "✅ Python3 found: $(python3 --version)"

# Check Chrome
if command -v "Google Chrome" &> /dev/null || command -v google-chrome &> /dev/null; then
    echo "✅ Chrome found"
else
    echo "⚠️  Chrome not found in PATH (may be installed, just not in PATH)"
fi

echo ""
echo "📋 Setup Complete! Your project is ready."
echo ""
echo "🚀 Quick Start:"
echo ""
echo "1️⃣  BUILD EXTENSION:"
echo "   ./build-extension.sh"
echo ""
echo "2️⃣  TERMINAL 1 - Start Backend (needs OpenAI API key):"
echo "   export OPENAI_API_KEY='sk-your-key-here'"
echo "   ./start-backend.sh"
echo ""
echo "3️⃣  TERMINAL 2 - Start Pose Detection (optional):"
echo "   ./start-pose-detection.sh"
echo ""
echo "4️⃣  LOAD EXTENSION IN CHROME:"
echo "   chrome://extensions"
echo "   → Developer mode ON"
echo "   → Load unpacked → select 'extension/dist' folder"
echo ""
echo "5️⃣  TEST:"
echo "   - Open any website"
echo "   - Click extension icon"
echo "   - Chat with your pet! 🐱"
echo ""
echo "📚 See docs:"
echo "   - QUICKSTART.md  - Quick setup guide"
echo "   - ARCHITECTURE.md - System architecture"
echo ""
