import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This safely embeds only the API_KEY env var into the client-side code during the build.
    // Default to empty string if not set to prevent 'undefined' replacement issues.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
});