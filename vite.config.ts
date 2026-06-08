import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

// Custom plugin: copies sw.js from project root into dist/ verbatim so it
// doesn't go through Rollup bundling and keeps its correct scope ("/").
function copyServiceWorker() {
  return {
    name: 'copy-service-worker',
    closeBundle() {
      const src = resolve(__dirname, 'sw.js');
      const dest = resolve(__dirname, 'dist/sw.js');
      try {
        mkdirSync(resolve(__dirname, 'dist'), { recursive: true });
        copyFileSync(src, dest);
      } catch (err) {
        console.warn('[copy-service-worker] Could not copy sw.js:', err);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    copyServiceWorker(),
    visualizer({
      filename: 'dist/artifacts/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/material/styles', '@mui/icons-material'],
          'vendor-date': ['@mui/x-date-pickers', 'dayjs'],
          'vendor-leaflet': ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/material/styles',
      '@mui/icons-material',
      '@mui/x-date-pickers',
      'dayjs',
      'leaflet',
      'react-leaflet',
    ],
  },
});
