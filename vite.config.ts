import { resolve } from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 4200,
  },
  plugins: [
    react(),
    dts({
      include: ['src/scrollbar'],
      outDir: 'dist',
      tsconfigPath: 'tsconfig.json',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/scrollbar/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
    copyPublicDir: false,
  },
});
