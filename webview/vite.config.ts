import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { DEV_PORT } from '../src/port';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: DEV_PORT,
    strictPort: true,
		cors: { origin: "*" },
		headers: { "Access-Control-Allow-Origin": "*" },
  },
})
