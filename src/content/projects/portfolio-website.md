---
title: Portfolio Website
description: This site. A fast, static portfolio built with Astro, Tailwind CSS and TypeScript, deployed to GitHub Pages.
date: 2026-10-15
tags: [Astro, Tailwind CSS, TypeScript]
repo: https://github.com/ThomasMarcCarter/Portfolio-Website
featured: true
cover:
  src: ../../assets/projects/portfolio-website/cover.png
  alt: The portfolio home page with a large two-line name heading
media:
  - type: video
    src: projects/portfolio-website/walkthrough.mp4
    poster: ../../assets/projects/portfolio-website/cover.png
    alt: A walkthrough of the site, from the home page into the Two-Stick Z Shooter page and its gameplay gallery, then back home and into dark mode
    caption: Walkthrough of the site, including the Z Shooter page
  - type: image
    src: ../../assets/projects/portfolio-website/home-dark.png
    alt: Project posts on the home page in dark mode
    caption: Project posts in dark mode
  - type: image
    src: ../../assets/projects/portfolio-website/radar-page.png
    alt: The Two-Stick Z Shooter page with its radar theme
    caption: A project page with its own radar theme
  - type: image
    src: ../../assets/projects/portfolio-website/mobile-light.png
    alt: The home page on a phone
    caption: The home page on a phone
---

## Overview

A personal portfolio to show my web development work. Each project is a Markdown file with a cover image and a gallery of photos and videos, so adding a new one means adding a single file.

## What I focused on

- Performance: static HTML, with small scripts only for the carousel, clock and theme switch
- Motion that adds to the page without getting in the way, and switches off when your system asks for reduced motion
- Accessibility: semantic markup, keyboard navigation and a skip link
- Project pages can have their own look, like the radar theme on the Two-Stick Z Shooter page
