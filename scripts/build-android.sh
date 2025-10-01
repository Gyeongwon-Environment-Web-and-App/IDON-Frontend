#!/bin/bash

# Android Build Script for KyoungWon App
# This script builds the Android release APK and AAB

set -e  # Exit on any error

echo "🚀 Starting Android build process..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and fill in your keystore details."
    exit 1
fi

# Load environment variables
source .env

# Check if required environment variables are set
if [ -z "$KEYSTORE_PASSWORD" ] || [ -z "$KEY_ALIAS" ] || [ -z "$KEY_PASSWORD" ]; then
    echo "❌ Error: Missing required environment variables!"
    echo "Please check your .env file and ensure all keystore details are set."
    exit 1
fi

# Check if keystore file exists
if [ ! -f "android/app/release-key.keystore" ]; then
    echo "❌ Error: Keystore file not found!"
    echo "Please create the keystore file first using the deployment guide."
    exit 1
fi

echo "📦 Building web assets..."
npm run build

echo "🔄 Syncing Capacitor..."
npx cap sync android

echo "🔨 Building Android APK..."
cd android
./gradlew assembleRelease

echo "📱 Building Android App Bundle (AAB)..."
./gradlew bundleRelease

echo "✅ Build completed successfully!"
echo ""
echo "📁 Generated files:"
echo "   APK: android/app/build/outputs/apk/release/app-release.apk"
echo "   AAB: android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "🎯 Next steps:"
echo "   1. Test the APK on your device"
echo "   2. Upload the AAB to Google Play Console"
echo "   3. Complete the store listing and submit for review"
