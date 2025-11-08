import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
    proxy: {
      // Proxy API requests to backend to avoid CORS/cookie issues in development
      '/api': {
        target: 'http://localhost:8180',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
