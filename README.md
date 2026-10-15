# Portfolio Website
Portfolio Website made to showcase web development skills.

Built with [Astro](https://astro.build), [Tailwind CSS](https://tailwindcss.com) and TypeScript. Deployed to GitHub Pages.

## Getting started

Requires Node.js 22.22 or later.

```sh
npm install
npm run dev      # start the dev server at http://localhost:4321
npm run build    # build the static site into dist/
npm run preview  # preview the production build
npm run check    # type-check .astro and .ts files
```

## Project structure

```
src/
  components/        Header, Footer, ProjectCard, ThemeToggle
  content/projects/  One Markdown file per project
  data/site.ts       Name, tagline, email, social links, nav and skills
  layouts/           BaseLayout (head, meta, theme, header/footer)
  pages/             Home, projects list, project detail, 404
  styles/global.css  Tailwind import and theme tokens
```

### Adding a project

Create `src/content/projects/my-project.md`:

```md
---
title: My Project
description: One-sentence summary shown on the card.
date: 2026-10-01
tags: [React, TypeScript]
repo: https://github.com/you/my-project   # optional
demo: https://my-project.example.com      # optional
featured: true                            # show on the home page
---

Write-up goes here.
```

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main`.
In the repository settings, set **Pages → Source** to **GitHub Actions**. The workflow sets the
site URL and base path automatically, so it works for both `username.github.io` and project repos.
