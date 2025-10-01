#!/bin/bash

# iOS Build Script for KyoungWon App
# This script builds the iOS app for App Store submission

set -e  # Exit on any error

echo "🍎 Starting iOS build process..."

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Error: iOS builds can only be done on macOS!"
    exit 1
fi

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Error: Xcode is not installed!"
    echo "Please install Xcode from the Mac App Store."
    exit 1
fi

echo "📦 Building web assets..."
npm run build

echo "🔄 Syncing Capacitor..."
npx cap sync ios

echo "🔨 Building iOS app..."
npx cap build ios --prod

echo "📱 Opening Xcode for final build and archive..."
npx cap open ios

echo "✅ Build process completed!"
echo ""
echo "🎯 Next steps in Xcode:"
echo "   1. Select 'Any iOS Device' as the target"
echo "   2. Go to Product → Archive"
echo "   3. Wait for archive to complete"
echo "   4. Click 'Distribute App' → 'App Store Connect'"
echo "   5. Follow the upload process"
echo ""
echo "📝 Don't forget to:"
echo "   - Update version and build numbers in Xcode"
echo "   - Verify signing settings"
echo "   - Complete app information in App Store Connect"
