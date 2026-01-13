#!/bin/sh

# Azure App Service startup script for Next.js standalone deployment
# This script ensures the application starts correctly in Azure environment

echo "Starting Next.js application..."

# Change to application directory
cd /home/site/wwwroot

# Display Node.js version
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Check if server.js exists (standalone build output)
if [ -f "server.js" ]; then
    echo "Found server.js - starting standalone server"
    # Set PORT if not already set (Azure provides this)
    export PORT=${PORT:-8080}
    echo "Starting on port: $PORT"
    node server.js
else
    echo "Error: server.js not found"
    echo "Please ensure Next.js is built with output: 'standalone' in next.config.ts"
    exit 1
fi
