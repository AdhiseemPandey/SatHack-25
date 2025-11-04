#!/bin/bash

echo "🛡️  Sovereign Identity Guardian - Setup Started"
echo "=============================================="

# Check Node.js version
echo "🔍 Checking Node.js version..."
NODE_VERSION=$(node -v)
if [ "$NODE_VERSION" != "v22.13.0" ]; then
    echo "⚠️  Warning: Expected Node.js v22.13.0, found $NODE_VERSION"
else
    echo "✅ Node.js version: $NODE_VERSION"
fi

# Check Python version
echo "🔍 Checking Python version..."
PYTHON_VERSION=$(python3 --version)
if [[ "$PYTHON_VERSION" != *"3.13.9"* ]]; then
    echo "⚠️  Warning: Expected Python 3.13.9, found $PYTHON_VERSION"
else
    echo "✅ Python version: $PYTHON_VERSION"
fi

# Create necessary directories
echo "📁 Creating project structure..."
mkdir -p backend/src/routes
mkdir -p backend/src/config
mkdir -p frontend/src/components
mkdir -p frontend/public
mkdir -p ai-models/transaction_scanner
mkdir -p ai-models/email_scanner

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Setup Python environment
echo "🐍 Setting up Python environment..."
cd ai-models
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Train AI models
echo "🤖 Training AI models..."
cd transaction_scanner
python model.py
cd ../email_scanner
python model.py
cd ../..

echo ""
echo "✅ SETUP COMPLETED SUCCESSFULLY!"
echo "🎯 Next steps:"
echo "   1. Configure environment variables in backend/.env"
echo "   2. Start backend: npm run dev:backend"
echo "   3. Start frontend: npm run dev:frontend"
echo "   4. Open http://localhost:3000"
echo ""
echo "🛡️  Sovereign Identity Guardian is ready to protect your transactions!"