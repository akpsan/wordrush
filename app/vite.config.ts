/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The word lists live in ../data/dictionaries, shared with the simulator.
const repoRoot = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: { fs: { allow: [repoRoot] } },
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
