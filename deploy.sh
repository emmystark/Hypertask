#!/bin/bash
# HyperTask AI - Quick Start Deployment Script
# Production ready. Execute this to deploy.

set -e

echo "🚀 HyperTask AI - Production Deployment"
echo "========================================"
echo ""

# Check environment
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found"
    exit 1
fi

echo "✅ Environment found"

# Activate virtual environment
source .venv/bin/activate

# Verify dependencies
echo ""
echo "Checking dependencies..."
python -c "import fastapi, uvicorn, httpx, loguru; print('✅ All dependencies available')" || {
    echo "❌ Missing dependencies"
    exit 1
}

# Check HF token
if [ -f ".env" ]; then
    source .env
    if [ -z "$HF_TOKEN" ]; then
        echo "⚠️  HF_TOKEN not set in .env"
        echo "   Models will not work without it"
        echo "   Add: HF_TOKEN=hf_xxxxx to .env"
    else
        echo "✅ HF_TOKEN configured"
    fi
else
    echo "⚠️  .env file not found"
    echo "   Create .env with HF_TOKEN=your_token"
fi

# Start API
echo ""
echo "Starting API server..."
cd ai-agents

PORT=${API_PORT:-8000}
echo ""
echo "🎯 API running on http://localhost:$PORT"
echo "📚 Docs: http://localhost:$PORT/docs"
echo ""
echo "Press Ctrl+C to stop"
echo ""

python -m uvicorn api.main:app --host 0.0.0.0 --port $PORT
