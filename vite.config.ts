import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true
      }
    }),
    tailwindcss()
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@shared/components': resolve(__dirname, 'src/shared/components'),
      '@views': resolve(__dirname, 'src/views'),
      '@layouts': resolve(__dirname, 'src/layouts'),
      '@store': resolve(__dirname, 'src/store'),
      '@router': resolve(__dirname, 'src/router'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@constant': resolve(__dirname, 'src/constant'),
      '@lib': resolve(__dirname, 'src/lib'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@types': resolve(__dirname, 'src/types')
    }
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['test.app.chutneyads.com', 'www.test.app.chutneyads.com']
  }
})