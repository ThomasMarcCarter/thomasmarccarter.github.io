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
    { label: 'Experience', href: '#experience' },
    { label: 'Contact', href: '#contact' },
  ],
  // Most recent first. Dates are ISO months; an end of null means the role is current.
  experience: [
    {
      company: 'Tamar Gaming',
      location: 'Ivybridge',
      roles: [
        { title: 'Service Team Leader', start: '2025-12', end: null },
        { title: 'Field Service Engineer', start: '2025-09', end: '2025-12' },
      ],
      points: [
        'Lead a team of 10 field service engineers covering 300+ customer sites across the South West.',
        'Brought average downtime under 2 hours with a 95% same-day fix rate, through structured fault triage and root-cause analysis of software, network and hardware issues.',
        'Explain technical issues and options to customers and senior management, and work with them to redesign service processes.',
      ],
    },
    {
      company: 'Scheidt & Bachmann UK',
      location: 'South West England',
      roles: [{ title: 'Field Service Engineer', start: '2024-04', end: '2025-09' }],
      points: [
        'Installed, configured and integrated networked car park systems, connecting ANPR cameras, pay stations, barriers and level counting equipment to back-end servers.',
        'Configured servers and networks and diagnosed integration faults across multi-component systems.',
        'Worked on site for customers including Drake Circus Shopping Centre in Plymouth, The NEC in Birmingham and Derriford Hospital.',
      ],
    },
    {
      company: 'ByteDance',
      location: 'Remote',
      roles: [{ title: 'Application Engineer', start: '2023-04', end: '2024-04' }],
      points: [
        'Designed and ran test plans for pre-release features in TikTok, CapCut and PICO on desktop and mobile, covering functional, UI and localisation testing.',
        'Gave usability feedback on features in development and wrote clear defect reports so developers could fix issues quickly.',
        'Worked with engineering and product teams in an Agile release cycle.',
      ],
    },
    {
      company: 'GlobalStep',
      location: 'Remote',
      roles: [{ title: 'QA Engineer', start: '2022-03', end: '2023-04' }],
      points: [
        'Ran functional and regression testing on games, covering gameplay, UI, graphics, audio and user experience.',
        'Verified builds against requirements with structured test cases, tracking defects through to resolution in Jira.',
      ],
    },
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
