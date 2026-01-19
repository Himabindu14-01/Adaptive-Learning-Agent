import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This allows process.env.API_KEY to work in client-side code for this specific demo architecture.
    // In a production app, you would typically use import.meta.env.VITE_API_KEY
    'process.env': process.env
  }
});