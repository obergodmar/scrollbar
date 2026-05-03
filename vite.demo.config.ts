import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/scrollbar/',
  plugins: [react()],
  build: {
    outDir: 'demo-dist',
  },
});
