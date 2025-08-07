import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/geocode": {
        target: "https://maps.apigw.ntruss.com",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/geocode/, "/map-geocode/v2/geocode"),
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            // API 키를 헤더에 추가
            if (req.headers["x-api-key-id"] && req.headers["x-api-key"]) {
              proxyReq.setHeader(
                "x-ncp-apigw-api-key-id",
                req.headers["x-api-key-id"]
              );
              proxyReq.setHeader(
                "x-ncp-apigw-api-key",
                req.headers["x-api-key"]
              );
            }
          });
        },
      },
    },
  },
});
