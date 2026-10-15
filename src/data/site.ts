// Central place for personal details and links used across the site.
export const site = {
  name: 'Thomas-Marc Carter',
  role: 'Full-stack developer',
  location: 'Torquay, Devon',
  availability: 'Looking for junior and graduate developer roles, and happy to relocate.',
  description:
    'Thomas-Marc Carter is a full-stack developer in Torquay, Devon, looking for junior and graduate developer roles.',
  email: 'thomasmarccarter@icloud.com',
  socials: [
    { label: 'GitHub', href: 'https://github.com/ThomasMarcCarter' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/thomas-marc-carter/' },
  ],
  nav: [
    { label: 'Work', href: '#work' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],
  skills: [
    { group: 'Web', items: ['TypeScript', 'JavaScript', 'HTML', 'CSS', 'React', 'Astro', 'Tailwind CSS', 'Node.js'] },
    { group: 'Game development', items: ['Unity', 'C#'] },
    { group: 'Tools', items: ['Git'] },
  ],
};

// Prefix a site-relative path with the configured base (needed for GitHub Pages project sites).
export function url(path = '') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (path.startsWith('#') || /^[a-z]+:/i.test(path)) return path;
  return `${base}/${path.replace(/^\//, '')}`;
}
