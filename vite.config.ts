import path from 'node:path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'fs-extra';

const publicDir = path.join(__dirname, './public');
const htmlFileName = 'index.html';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),
    {
      name: 'vite:update-img-src',
      enforce: 'post',
      generateBundle: async (_, bundle) => {
        const htmlFile = bundle[htmlFileName];

        if (!htmlFile || !('source' in htmlFile) || typeof htmlFile.source !== 'string') {
          return;
        }

        const publicFileNames = await fs.readdir(publicDir);

        for (const publicFileName of publicFileNames) {
          const absolutePath = `"/${publicFileName}"`;
          const relativePath = `"./${publicFileName}"`;

          console.log(`Updating image source: ${absolutePath} => ${relativePath}`);
          htmlFile.source = htmlFile.source.replaceAll(absolutePath, relativePath);
        }
      }
    },
  ],
});
