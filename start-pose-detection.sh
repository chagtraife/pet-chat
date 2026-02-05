#!/bin/bash
# Start pose detection server
# Usage: ./start-pose-detection.sh

cd "$(dirname "$0")/pose_detection"

echo "🐾 Starting Pose Detection Service..."
echo ""

# Check if Flask is installed
if ! python3 -c "import flask" 2>/dev/null; then
    echo "📦 Installing Flask..."
    pip3 install flask 2>/dev/null
fi

echo "✅ Pose Detection starting on http://localhost:5000"
echo "Press Ctrl+C to stop"
echo ""
echo "Available endpoints:"
echo "  GET  /health        - Health check"
echo "  POST /detect        - Detect pose from image (base64)"
echo "  POST /detect-video  - Detect pose from video (base64)"
echo ""

python3 flask_app.py
