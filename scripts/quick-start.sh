#!/bin/bash

echo "🚀 SELLIKO - Quick Start Setup"
echo "==============================="

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install essential packages for rapid development
echo "⚡ Installing essential packages..."
npm install react-hook-form zod @tanstack/react-query socket.io-client react-hot-toast lucide-react class-variance-authority

# Install dev dependencies
echo "🛠️ Installing dev dependencies..."
npm install -D @types/node

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "🔧 Creating environment file..."
    cat > .env.local << 'EOF'
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/selliko_dev"
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id"
WHATSAPP_ACCESS_TOKEN="your_access_token"
WHATSAPP_VERIFY_TOKEN="your_verify_token"

# AWS S3
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
S3_BUCKET_NAME="selliko-uploads"

# Razorpay
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"

# Application
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"

# Development
LOG_LEVEL="debug"
EOF
    echo "✅ Environment file created: .env.local"
else
    echo "⚠️ Environment file already exists"
fi

# Make scripts executable
chmod +x scripts/*.sh

echo ""
echo "🎯 Setup Complete! Next steps:"
echo "1. Update .env.local with your actual API keys"
echo "2. Run 'npm run dev' to start development"
echo "3. Open docs/RAPID_DEVELOPMENT_STRATEGY.md for the implementation plan"
echo ""
echo "🚀 Ready to build an amazing marketplace!" 