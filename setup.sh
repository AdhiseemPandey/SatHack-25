#!/bin/bash

echo "🛡️  Sovereign Identity Guardian - Setup Script"
echo "=============================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed. Please install npm."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create necessary directories
echo "📁 Creating directory structure..."
mkdir -p logs
mkdir -p data

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Setup Backend
echo "🚀 Setting up Backend..."
cd backend
if [ ! -f ".env" ]; then
    echo "📝 Creating backend environment file..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your configuration"
fi

npm install
cd ..

# Setup Frontend
echo "🌐 Setting up Frontend..."
cd frontend
npm install
cd ..

# Setup AI Models
echo "🤖 Setting up AI Models..."
cd ai-models

# Check if virtual environment exists, if not create one
if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create data storage directory
mkdir -p training_data

# Train initial AI models
echo "🧠 Training initial AI models..."
python train_all_models.py

cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit backend/.env with your configuration"
echo "   2. Run 'npm run dev' to start development servers"
echo "   3. Open http://localhost:3000 in your browser"
echo ""
echo "🛡️  Sovereign Identity Guardian is ready to protect!"