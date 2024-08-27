import react from '@vitejs/plugin-react-swc';

import { defineConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 4200,
  },
  plugins: [
    react(),

    viteTsConfigPaths({
      root: './',
      parseNative: true,
    }),
  ],
});
