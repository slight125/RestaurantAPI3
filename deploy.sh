#!/bin/bash

# Restaurant Management API Deployment Script
echo "🚀 Starting Restaurant Management API deployment..."

# Set environment variables for deployment
export NODE_ENV=production
export PORT=3000
export DATABASE_URL="postgresql://restaurant_user:restaurant_pass@localhost:5432/restaurant_db"
export JWT_SECRET="super-secret-jwt-key-for-production-change-this"
export JWT_EXPIRES_IN="7d"
export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USER="your-email@gmail.com"
export SMTP_PASS="your-app-password"
export FRONTEND_URL="http://localhost:3001"
export ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

echo "✅ Environment variables set"

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔧 Starting the API server..."

# Start the server using ts-node for development deployment
npx ts-node src/index.ts

