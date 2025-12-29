#!/bin/bash
# Build extension and create downloadable ZIP

set -e

echo "📦 Building FakeSOL Chrome Extension..."

# Navigate to extension directory
cd "$(dirname "$0")/../extension"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the extension
echo "Building..."
npm run build

# Create ZIP file
echo "Creating ZIP archive..."
cd dist
zip -r ../../public/fakesol-extension.zip .

echo "✅ Extension ZIP created at public/fakesol-extension.zip"
