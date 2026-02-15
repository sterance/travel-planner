import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
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