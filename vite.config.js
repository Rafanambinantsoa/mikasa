import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      // /esm/icons/index.mjs only exports the icons statically, so no separate chunks are created
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
    },
  },
  // Add optimization settings
  optimizeDeps: {
    include: ['react', 'react-dom', '@tabler/icons-react', 'iconsax-react'],
    exclude: []
  },
  // Add build optimization
  build: {
    // Improve build performance
    target: 'esnext',
    // Reduce disk space usage during build
    sourcemap: false,
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'icons': ['@tabler/icons-react', 'iconsax-react']
        }
      }
    }
  }
})
