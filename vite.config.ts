import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/harsh-himanshi-wedding/',
  plugins: [react()],
  server: {
    port: 3000,
    // Expose to LAN so you can test on a real phone
    host: '0.0.0.0',
    open: false,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks: {
          'three-core': ['three'],
          'r3f': ['@react-three/fiber', '@react-three/drei'],
          'gsap': ['gsap'],
        },
      },
    },
  },
});
