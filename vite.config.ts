import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip',
          ],
          'table-vendor': ['@tanstack/react-table'],
          'date-vendor': ['react-day-picker', 'date-fns'],
          'icon-vendor': ['lucide-react'],
        },
      },
    },
    minify: 'esbuild',
    sourcemap: false,
    copyPublicDir: true,
    // Enable compression for better performance
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'recharts',
      '@tanstack/react-table',
      'react-day-picker',
      'date-fns',
      'lucide-react',
    ],
    // Force optimization for better performance
    force: true,
  },
  // Add CSS optimization
  css: {
    devSourcemap: false,
  },
  // Performance optimizations
  esbuild: {
    // Enable tree shaking
    treeShaking: true,
    // Optimize for production
    target: 'es2020',
    // Minify identifiers
    minifyIdentifiers: true,
    // Minify syntax
    minifySyntax: true,
    // Minify whitespace
    minifyWhitespace: true,
  },
  server: {
    hmr: {
      port: 5173,
      host: 'localhost',
      clientPort: 5173,
    },
    proxy: {
      '/api/geocode': {
        target: 'https://maps.apigw.ntruss.com',
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/geocode/, '/map-geocode/v2/geocode'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // API 키를 헤더에 추가
            if (req.headers['x-api-key-id'] && req.headers['x-api-key']) {
              proxyReq.setHeader(
                'x-ncp-apigw-api-key-id',
                req.headers['x-api-key-id']
              );
              proxyReq.setHeader(
                'x-ncp-apigw-api-key',
                req.headers['x-api-key']
              );
            }
          });
        },
      },
      '/api/local': {
        target: 'https://openapi.naver.com',
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/local/, '/v1/search/local.json'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // 네이버 검색 API는 다른 헤더를 사용
            if (req.headers['x-client-id'] && req.headers['x-client-secret']) {
              proxyReq.setHeader(
                'X-Naver-Client-Id',
                req.headers['x-client-id']
              );
              proxyReq.setHeader(
                'X-Naver-Client-Secret',
                req.headers['x-client-secret']
              );
            }
          });
        },
      },
      '/api/kakao/search': {
        target: 'https://dapi.kakao.com',
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(
            /^\/api\/kakao\/search/,
            '/v2/local/search/keyword.json'
          ),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // 카카오맵 API는 Authorization 헤더 사용
            if (req.headers['authorization']) {
              proxyReq.setHeader('Authorization', req.headers['authorization']);
            }
          });
        },
      },
    },
  },
});
