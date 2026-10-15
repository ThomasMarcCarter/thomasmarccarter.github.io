// Central place for personal details and links used across the site.
export const site = {
  name: 'Thomas-Marc Carter',
  role: 'Web Developer',
  tagline: 'I build fast, accessible websites and web apps.',
  description: 'Portfolio of Thomas-Marc Carter, a web developer building fast, accessible websites and web apps.',
  email: 'hello@example.com',
  socials: [
    { label: 'GitHub', href: 'https://github.com/your-username' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/your-profile' },
  ],
  nav: [
    { label: 'Projects', href: 'projects/' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],
  skills: ['TypeScript', 'JavaScript', 'HTML', 'CSS', 'Astro', 'React', 'Tailwind CSS', 'Node.js', 'Git'],
};

// Prefix a site-relative path with the configured base (needed for GitHub Pages project sites).
export function url(path = '') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (path.startsWith('#') || /^[a-z]+:/i.test(path)) return path;
  return `${base}/${path.replace(/^\//, '')}`;
}
