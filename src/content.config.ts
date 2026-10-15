import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      repo: z.url().optional(),
      demo: z.url().optional(),
      featured: z.boolean().default(false),
      // Visual style for the project page: the site default, or a themed skin.
      skin: z.enum(['default', 'radar']).default('default'),
      cover: z.object({ src: image(), alt: z.string() }),
      // Photos and videos shown in the carousel. Videos live in public/ and are referenced by path.
      media: z
        .array(
          z.discriminatedUnion('type', [
            z.object({ type: z.literal('image'), src: image(), alt: z.string(), caption: z.string().optional() }),
            z.object({
              type: z.literal('video'),
              src: z.string(),
              poster: image().optional(),
              alt: z.string(),
              caption: z.string().optional(),
            }),
          ]),
        )
        .default([]),
    }),
});

export const collections = { projects };
