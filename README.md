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
  components/        Header, Footer, Section, ProjectPosts, Carousel, RadarScope, ThemeToggle
  content/projects/  One Markdown file per project
  data/site.ts       Name, tagline, email, social links, nav and skills
  layouts/           BaseLayout (head, meta, theme, header/footer)
  pages/             Home, projects list, project detail, 404
  styles/global.css  Tailwind import and theme tokens
```

### Adding a project

Put images in `src/assets/projects/my-project/` and videos in `public/projects/my-project/`, then create
`src/content/projects/my-project.md`:

```md
---
title: My Project
description: One-sentence summary shown on the post.
date: 2026-10-01
tags: [React, TypeScript]
repo: https://github.com/you/my-project   # optional
demo: https://my-project.example.com      # optional
featured: true                            # show on the home page
skin: default                             # or "radar" for the military radar theme
cover:
  src: ../../assets/projects/my-project/cover.png
  alt: What the cover image shows
media:                                    # gallery, shown after the cover
  - type: image
    src: ../../assets/projects/my-project/screen.png
    alt: What the image shows
    caption: Optional caption
  - type: video
    src: projects/my-project/demo.mp4     # path inside public/
    poster: ../../assets/projects/my-project/cover.png
    alt: What the video shows
---

Write-up goes here.
```

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main`.
In the repository settings, set **Pages → Source** to **GitHub Actions**. The workflow sets the
site URL and base path automatically, so it works for both `username.github.io` and project repos.
