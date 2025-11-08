#!/bin/bash

echo "🛡️  Sovereign Identity Guardian - Deployment Script"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Environment check
if [ "$1" = "production" ]; then
    echo "🚀 Deploying to Production Environment"
    ENV="production"
else
    echo "🔧 Deploying to Staging Environment"
    ENV="staging"
fi

# Build frontend
echo "🏗️  Building frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

# Ensure backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --production
if [ $? -ne 0 ]; then
    echo "❌ Backend dependencies installation failed"
    exit 1
fi
cd ..

# Ensure AI models are trained
echo "🧠 Verifying AI models..."
cd ai-models
source venv/bin/activate
python check_models.py
if [ $? -ne 0 ]; then
    echo "⚠️  AI models need retraining..."
    python train_all_models.py
fi
cd ..

# Create deployment package
echo "📁 Creating deployment package..."
DEPLOY_DIR="deploy-$ENV-$(date +%Y%m%d-%H%M%S)"
mkdir -p $DEPLOY_DIR

# Copy necessary files
cp -r backend $DEPLOY_DIR/
cp -r frontend/build $DEPLOY_DIR/frontend-build
cp -r ai-models $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp setup.sh $DEPLOY_DIR/
cp deploy.sh $DEPLOY_DIR/

# Create startup script
cat > $DEPLOY_DIR/start.sh << 'EOF'
#!/bin/bash
echo "🛡️  Starting Sovereign Identity Guardian..."

# Start backend
cd backend
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

echo "✅ Backend started (PID: $BACKEND_PID)"
echo "🌐 Application is running on http://localhost:5000"
echo "📊 Health check: http://localhost:5000/api/health"

# Wait for backend process
wait $BACKEND_PID
EOF

chmod +x $DEPLOY_DIR/start.sh

# Create PM2 ecosystem file for production
if [ "$ENV" = "production" ]; then
    cat > $DEPLOY_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'sovereign-guardian',
    script: './backend/src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF
fi

echo ""
echo "✅ Deployment package created: $DEPLOY_DIR"
echo ""
echo "📋 Deployment instructions:"
echo "   1. Upload $DEPLOY_DIR to your server"
echo "   2. Run './setup.sh' in the deployment directory"
echo "   3. For production: Install PM2 and run 'pm2 start ecosystem.config.js'"
echo "   4. For staging: Run './start.sh'"
echo ""
echo "🛡️  Deployment preparation completed!"