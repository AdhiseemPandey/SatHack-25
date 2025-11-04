#!/bin/bash

echo "🚀 Deploying Sovereign Identity Guardian..."
echo "=========================================="

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi
cd ..

# Create deployment directory
echo "📁 Creating deployment package..."
rm -rf deployment
mkdir -p deployment

# Copy backend
echo "📁 Copying backend..."
cp -r backend deployment/

# Copy frontend build
echo "📁 Copying frontend build..."
cp -r frontend/build deployment/frontend-static

# Copy AI models
echo "📁 Copying AI models..."
cp -r ai-models deployment/

# Copy configuration files
echo "📁 Copying configuration files..."
cp package.json deployment/
cp README.md deployment/
cp setup.sh deployment/
cp deploy.sh deployment/

# Create start script
echo "📄 Creating start script..."
cat > deployment/start.sh << 'EOF'
#!/bin/bash
echo "🛡️ Starting Sovereign Identity Guardian..."

# Start backend
cd backend
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Serve frontend (using serve)
npx serve ../frontend-static -p 3000 &
FRONTEND_PID=$!

echo "✅ Application started!"
echo "   Backend: http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo "   PIDs: $BACKEND_PID, $FRONTEND_PID"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
EOF

chmod +x deployment/start.sh

echo ""
echo "✅ DEPLOYMENT PACKAGE CREATED!"
echo "📁 Location: ./deployment"
echo ""
echo "🎯 Deployment instructions:"
echo "   1. Upload ./deployment to your server"
echo "   2. Run: chmod +x setup.sh && ./setup.sh"
echo "   3. Configure environment variables"
echo "   4. Run: ./start.sh"
echo ""
echo "🛡️  Deployment ready!"