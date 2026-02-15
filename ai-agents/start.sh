#!/bin/bash

# HyperTask Quick Start Script
# This script sets up and runs the complete HyperTask application

set -e

echo "🚀 HyperTask Setup Script"
echo "=========================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3.8+ and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "Please install Node.js 18+ and try again."
    exit 1
fi

echo " Prerequisites check passed"
echo ""

# Backend Setup
echo "📦 Setting up Backend..."
cd hypertask-backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate || . venv/Scripts/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -q -r requirements.txt

# Check for .env file
if [ ! -f ".env" ]; then
    echo "  No .env file found. Creating from template..."
    cp .env.example .env
    echo ""
    echo "  IMPORTANT: Please edit .env and add your Hugging Face token:"
    echo "   HF_TOKEN=your_token_here"
    echo ""
    echo "Get your token from: https://huggingface.co/settings/tokens"
    echo ""
    read -p "Press Enter after you've updated the .env file..."
fi

# Check if HF_TOKEN is set
if grep -q "your_huggingface_token_here" .env; then
    echo "❌ Please update HF_TOKEN in .env file"
    exit 1
fi

echo " Backend setup complete"
echo ""

# Frontend Setup
echo "📦 Setting up Frontend..."
cd ../hypertask-app

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local..."
    echo "NEXT_PUBLIC_API_URL=https://hypertask.onrender.com" > .env.local
fi

echo " Frontend setup complete"
echo ""

# Start services
echo "🎉 Setup complete! Starting services..."
echo ""
echo "Choose how to run:"
echo "1. Demo Mode (no AI models, fast)"
echo "2. Full Mode (with AI models, requires GPU/lots of RAM)"
echo ""
read -p "Enter choice (1 or 2): " mode

cd ..

if [ "$mode" = "1" ]; then
    echo ""
    echo "Starting in Demo Mode..."
    echo "Backend will use placeholder responses"
    echo ""
    
    # Start backend in background
    cd hypertask-backend
    source venv/bin/activate
    python api/main.py &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    sleep 3
    
    # Start frontend
    cd hypertask-app
    echo ""
    echo "🌐 Starting frontend..."
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: https://hypertask.onrender.com"
    echo "   API Docs: https://hypertask.onrender.com/docs"
    echo ""
    echo "Press Ctrl+C to stop all services"
    echo ""
    
    npm run dev
    
    # Cleanup
    kill $BACKEND_PID 2>/dev/null
    
elif [ "$mode" = "2" ]; then
    echo ""
    echo "Starting in Full Mode..."
    echo "  This will download large AI models on first run!"
    echo "  Requires significant RAM/VRAM"
    echo ""
    read -p "Continue? (y/n): " confirm
    
    if [ "$confirm" != "y" ]; then
        echo "Aborted."
        exit 0
    fi
    
    # Start backend in background
    cd hypertask-backend
    source venv/bin/activate
    python api/main.py &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to initialize models
    echo "⏳ Waiting for AI models to load (this may take several minutes)..."
    sleep 10
    
    # Start frontend
    cd hypertask-app
    echo ""
    echo "🌐 Starting frontend..."
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: https://hypertask.onrender.com"
    echo "   API Docs: https://hypertask.onrender.com/docs"
    echo ""
    echo "Press Ctrl+C to stop all services"
    echo ""
    
    npm run dev
    
    # Cleanup
    kill $BACKEND_PID 2>/dev/null
    
else
    echo "Invalid choice. Exiting."
    exit 1
fi