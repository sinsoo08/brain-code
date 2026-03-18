import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // API 요청을 Spring Boot로 프록시
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // OAuth2 요청을 Spring Boot로 프록시 (/oauth2/redirect는 React가 처리하므로 제외)
      '/oauth2/authorization': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/login/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    }
  }
})
