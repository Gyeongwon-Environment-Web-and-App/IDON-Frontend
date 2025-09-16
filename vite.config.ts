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
  server: {
    proxy: {
      '/api/geocode': {
        target: 'https://maps.apigw.ntruss.com',
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/geocode/, '/map-geocode/v2/geocode'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
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
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
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
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
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
