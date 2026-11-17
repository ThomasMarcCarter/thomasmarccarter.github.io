// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// SITE and BASE_PATH are set by the GitHub Pages workflow; locally the site is served from "/".
// https://astro.build/config
export default defineConfig({
  site: process.env.SITE,
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },

  vite: {
    plugins: [tailwindcss()],
    // The React integration's own prebundle list isn't applied in dev, so react-dom/client is served as CommonJS and islands fail to hydrate.
    optimizeDeps: { include: ['react', 'react-dom', 'react-dom/client', 'react/jsx-dev-runtime'] }
  },

  integrations: [react()]
});