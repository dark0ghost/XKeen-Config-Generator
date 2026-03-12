import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Plugin to copy documentation files
 */
function copyDocs() {
  return {
    name: 'copy-docs',
    closeBundle() {
      const docsDir = 'dist/docs';
      const srcDocsDir = 'docs';
      
      if (!existsSync(docsDir)) {
        mkdirSync(docsDir, { recursive: true });
      }
      
      // Copy documentation files
      copyFileSync(
        join(srcDocsDir, 'index.html'),
        join(docsDir, 'index.html')
      );
      copyFileSync(
        join(srcDocsDir, 'en.html'),
        join(docsDir, 'en.html')
      );
      
      console.log('✓ Documentation copied to dist/docs/');
    }
  };
}

export default defineConfig({
  plugins: [vue(), copyDocs()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
