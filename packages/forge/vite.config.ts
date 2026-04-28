import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'statili',
      fileName: 'forge',
      formats: ['es']
    },
    rollupOptions: {
      external: ['@statili/fp', '@statili/stats'],
    },
    sourcemap: true,
    minify: false,
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      exclude: [
        '**/*.test.ts'
      ],
      rollupTypes: true
    })
  ],
});
