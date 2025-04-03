import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'  //开发者工具

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools(),
  ],
  resolve: {
    // alias: {
    //   '@': fileURLToPath(new URL('./src', import.meta.url))
    // },
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, './src')
      }
    ]
  },
  server: {
    port: 1024,
    hmr: true,
    proxy: {
      '/api': {
        target: 'http://localhost:7090',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '')  提示的脚本
        pathRewrite: {
          "^api": "/api"
        }
      }
    }
  },
})
