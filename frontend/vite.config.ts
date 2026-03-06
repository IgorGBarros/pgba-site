// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    port: 3000,
    open: true,
    host:true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
  
    },
  },
});