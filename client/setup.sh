#!/bin/bash

# Im-Host Platform Development Setup Script
echo "🏠 Setting up Im-Host Platform..."

# Check if we're in the client directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the client directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install additional required packages
echo "📦 Installing additional packages..."
npm install socket.io-client@latest
npm install @stripe/stripe-js@latest
npm install react-router-dom@latest
npm install @tanstack/react-query@latest
npm install class-variance-authority@latest
npm install clsx@latest
npm install tailwind-merge@latest

# Install development dependencies
echo "📦 Installing development dependencies..."
npm install -D @types/node@latest

# Create service worker if it doesn't exist
if [ ! -f "public/sw.js" ]; then
    echo "⚙️ Creating service worker..."
    cat > public/sw.js << 'EOL'
// Service Worker for Im-Host Platform
const CACHE_NAME = 'im-host-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Im-Host', options)
  );
});
EOL
fi

# Create manifest.json if it doesn't exist
if [ ! -f "public/manifest.json" ]; then
    echo "📱 Creating PWA manifest..."
    cat > public/manifest.json << 'EOL'
{
  "name": "Im-Host Platform",
  "short_name": "Im-Host",
  "description": "Premium hosting platform with real-time features",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#8b5cf6",
  "orientation": "portrait-primary",
  "categories": ["travel", "business"],
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png", 
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshot-wide.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshot-narrow.png",
      "sizes": "640x1136", 
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
EOL
fi

# Update package.json scripts if needed
echo "⚙️ Updating package.json scripts..."
npm pkg set scripts.dev="vite"
npm pkg set scripts.build="tsc && vite build"
npm pkg set scripts.preview="vite preview"
npm pkg set scripts.lint="eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
npm pkg set scripts.type-check="tsc --noEmit"

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOL'
# Dependencies
node_modules/
.pnp
.pnp.js

# Production build
/dist
/build

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Temporary folders
tmp/
temp/

# Build tools
.cache/
.parcel-cache/

# Service worker
sw.js.map
EOL
fi

# Create development environment file
if [ ! -f ".env.development" ]; then
    echo "🔧 Creating development environment..."
    cat > .env.development << 'EOL'
# Development Environment Configuration
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
VITE_APP_TITLE=Im-Host Platform
VITE_APP_DESCRIPTION=Premium hosting platform with real-time features

# Payment Configuration (Development)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id_here

# Push Notifications (Development)
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_here

# Feature Flags
VITE_ENABLE_CHAT=true
VITE_ENABLE_PAYMENTS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_PWA=true

# Analytics (Development)
VITE_GA_TRACKING_ID=your_ga_tracking_id_here

# File Upload
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=image/*,application/pdf,text/*
EOL
fi

# Create basic app icons (placeholder)
echo "🎨 Creating placeholder app icons..."
mkdir -p public
# You would typically add real icon generation here

# Create development server configuration
if [ ! -f "vite.config.local.ts" ]; then
    echo "⚙️ Creating development server config..."
    cat > vite.config.local.ts << 'EOL'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true,
      }
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', '@radix-ui/react-slot']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})
EOL
fi

# Run type check
echo "🔍 Running type check..."
npm run type-check

# Check if everything is working
echo "✅ Setup complete!"
echo ""
echo "🚀 Quick Start:"
echo "  npm run dev         # Start development server"
echo "  npm run build       # Build for production"
echo "  npm run preview     # Preview production build"
echo "  npm run lint        # Lint code"
echo "  npm run type-check  # Check TypeScript types"
echo ""
echo "📚 Next Steps:"
echo "  1. Review INTEGRATION_GUIDE.md for complete setup"
echo "  2. Configure your backend API endpoints"
echo "  3. Set up payment providers (Stripe, PayPal)"
echo "  4. Configure push notification service"
echo "  5. Customize branding and colors"
echo ""
echo "🌟 Your hosting platform is ready!"
