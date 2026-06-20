import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const useBackend = env.VITE_USE_BACKEND === 'true';

  return {
    plugins: [react()],
    server: useBackend
      ? {
          proxy: {
            '/api': 'http://localhost:4000',
            '/uploads': 'http://localhost:4000',
          },
        }
      : {},
  };
})
