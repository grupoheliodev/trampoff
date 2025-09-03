import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Adicione esta linha:
  base: '/trampoff/', // 👈 IMPORTANTE: Substitua "trampoff" pelo nome exato do seu repositório no GitHub
})