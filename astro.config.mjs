// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// SITE and BASE_PATH are set by the GitHub Pages workflow; locally the site is served from "/".
// https://astro.build/config
export default defineConfig({
  site: process.env.SITE,
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()]
  }
});
