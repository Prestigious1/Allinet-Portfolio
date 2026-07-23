/**
 * lib/ai/portfolio-data.ts
 *
 * Static portfolio data for AION context injection.
 * Replace with live CMS fetches once Payload CMS is seeded with real content.
 */

export const PORTFOLIO_DATA = {
  owner: {
    fullName:     'Ajibade Alli-Akinkunmi',
    displayName:  'Ajibade',
    title:        'Senior Full-Stack Engineer & AI Architect',
    bioShort:     'Building production-grade systems where AI meets beautiful design.',
    bioLong:      `Ajibade is a senior full-stack engineer and AI architect based in Lagos, Nigeria.
He specialises in building high-performance, visually stunning applications that push the boundaries of what's possible on the web.
With expertise spanning Next.js, React Three Fiber, Python, Kubernetes and LLM orchestration, he architects systems that are both technically rigorous and aesthetically exceptional.`,
    email:        'hello@allinet.dev',
    location:     'Lagos, Nigeria',
    githubUrl:    'https://github.com/Prestigious1',
    linkedinUrl:  'https://linkedin.com/in/ajibade-alli-akinkunmi',
    openToWork:   true,
    availability: 'Available for senior/lead roles and high-impact contracts.',
  },

  experiences: [
    {
      role:        'Senior Full-Stack Engineer',
      company:     'ALLINET Technologies',
      type:        'full-time',
      startDate:   '2022-01',
      endDate:     null,
      location:    'Lagos, Nigeria (Remote)',
      description: 'Leading architecture and development of enterprise SaaS platforms. Specialising in AI integration, 3D web experiences, and distributed systems.',
      techStack:   ['Next.js', 'TypeScript', 'Python', 'Kubernetes', 'PostgreSQL', 'Redis', 'OpenAI'],
    },
    {
      role:        'Full-Stack Developer',
      company:     'FinTech Startup',
      type:        'contract',
      startDate:   '2020-06',
      endDate:     '2021-12',
      location:    'Remote',
      description: 'Built real-time trading dashboards and payment systems processing £2M+ daily volume.',
      techStack:   ['React', 'Node.js', 'PostgreSQL', 'WebSockets'],
    },
  ],

  education: [
    {
      degree:      'BSc Computer Science',
      field:       'Computer Science',
      institution: 'University of Lagos',
      startDate:   '2016',
      endDate:     '2020',
    },
  ],

  projects: [
    {
      title:       'ALLINET OS Portfolio',
      slug:        'allinet-os',
      tagline:     'Award-winning browser-based OS portfolio with 3D environments and AI.',
      status:      'live',
      techStack:   ['Next.js 15', 'React Three Fiber', 'GSAP', 'Framer Motion', 'OpenAI', 'Payload CMS'],
      demoUrl:     'https://allinet.dev',
      repoUrl:     'https://github.com/ajibade/allinet-os',
    },
    {
      title:       'Agentic AI Orchestrator',
      slug:        'agentic-ai-orchestrator',
      tagline:     'Distributed multi-agent AI system with autonomous software engineering capabilities.',
      status:      'live',
      techStack:   ['Python', 'LangChain', 'Redis', 'FastAPI', 'Docker', 'Kubernetes'],
      demoUrl:     null,
      repoUrl:     'https://github.com/ajibade/agentic-ai-orchestrator',
    },
    {
      title:       'Real-Time Trading Dashboard',
      slug:        'trading-dashboard',
      tagline:     'Live financial data dashboard with WebSocket feeds and advanced charting.',
      status:      'live',
      techStack:   ['React', 'WebSockets', 'D3.js', 'Node.js', 'PostgreSQL'],
      demoUrl:     null,
      repoUrl:     null,
    },
  ],

  technologies: [
    { name: 'TypeScript',        proficiency: 5, category: 'frontend' },
    { name: 'React / Next.js',   proficiency: 5, category: 'frontend' },
    { name: 'Python',            proficiency: 5, category: 'backend'  },
    { name: 'Node.js',           proficiency: 5, category: 'backend'  },
    { name: 'PostgreSQL',        proficiency: 5, category: 'db'       },
    { name: 'React Three Fiber', proficiency: 4, category: 'frontend' },
    { name: 'OpenAI / LLMs',    proficiency: 5, category: 'ai'       },
    { name: 'Kubernetes',        proficiency: 4, category: 'devops'   },
    { name: 'Redis',             proficiency: 4, category: 'db'       },
    { name: 'Docker',            proficiency: 5, category: 'devops'   },
    { name: 'GraphQL',           proficiency: 4, category: 'backend'  },
    { name: 'Supabase',          proficiency: 4, category: 'db'       },
    { name: 'GSAP',              proficiency: 4, category: 'frontend' },
    { name: 'Framer Motion',     proficiency: 5, category: 'frontend' },
    { name: 'Go',                proficiency: 3, category: 'backend'  },
  ],

  certificates: [
    { name: 'AWS Solutions Architect',      issuer: 'Amazon Web Services', issueDate: '2023-03' },
    { name: 'Google Professional ML Engineer', issuer: 'Google Cloud',     issueDate: '2022-11' },
  ],
} as const

export type PortfolioData = typeof PORTFOLIO_DATA
