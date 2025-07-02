import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
     nodePolyfills({
      include: ['crypto', 'stream']
    })
  ],
  base: "./",
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          leaflet: ['leaflet', 'react-leaflet'],
          supabase: ['@supabase/supabase-js'],
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://disaster-response-coordination-platform-bpta.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'https://disaster-response-coordination-platform-bpta.onrender.com',
        ws: true,
        changeOrigin: true,
      }
    }
  },

})
