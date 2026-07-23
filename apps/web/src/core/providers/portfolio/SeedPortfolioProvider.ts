import {
  PortfolioProvider,
  PortfolioOwner,
  ProjectData,
  ExperienceData,
  EducationData,
  CertificateData,
  TestimonialData,
  BlogPostData,
  SiteSettings,
  SkillData,
  DesktopAppData,
} from './PortfolioProvider'
import { PORTFOLIO_DATA } from '@/lib/ai/portfolio-data'

export class SeedPortfolioProvider implements PortfolioProvider {
  async getDesktopApps(): Promise<DesktopAppData[]> {
    return [
      { id: 'seed-about',    appId: 'about',    label: 'About Me',      iconName: '👤', iconMediaUrl: undefined, showOnDesktop: true,  showInDock: true,  showInMenu: true, showInSearch: true, desktopPosition: { x: 20, y: 20 },  dockPosition: 1 },
      { id: 'seed-projects', appId: 'projects', label: 'Projects',      iconName: '🗂️', iconMediaUrl: undefined, showOnDesktop: true,  showInDock: true,  showInMenu: true, showInSearch: true, desktopPosition: { x: 20, y: 110 }, dockPosition: 2 },
      { id: 'seed-resume',   appId: 'resume',   label: 'Resume',        iconName: '📄', iconMediaUrl: undefined, showOnDesktop: true,  showInDock: true,  showInMenu: true, showInSearch: true, desktopPosition: { x: 20, y: 200 }, dockPosition: 3 },
      { id: 'seed-skills',   appId: 'skills',   label: 'Skills',        iconName: '⚡', iconMediaUrl: undefined, showOnDesktop: true,  showInDock: true,  showInMenu: true, showInSearch: true, desktopPosition: { x: 20, y: 290 }, dockPosition: 4 },
      { id: 'seed-terminal', appId: 'terminal', label: 'Terminal',      iconName: '💻', iconMediaUrl: undefined, showOnDesktop: true,  showInDock: true,  showInMenu: true, showInSearch: true, desktopPosition: { x: 20, y: 380 }, dockPosition: 5 },
      { id: 'seed-contact',  appId: 'contact',  label: 'Contact',       iconName: '✉️', iconMediaUrl: undefined, showOnDesktop: true,  showInDock: true,  showInMenu: true, showInSearch: true, desktopPosition: { x: 20, y: 470 }, dockPosition: 6 },
      { id: 'seed-github',   appId: 'github',   label: 'GitHub',        iconName: '🐙', iconMediaUrl: undefined, showOnDesktop: true,  showInDock: true,  showInMenu: true, showInSearch: true, desktopPosition: { x: 20, y: 560 }, dockPosition: 7 },
      { id: 'seed-ai',       appId: 'ai',       label: 'AION',          iconName: '🤖', iconMediaUrl: undefined, showOnDesktop: false, showInDock: true,  showInMenu: true, showInSearch: true, desktopPosition: null,               dockPosition: 8 },
      { id: 'seed-settings', appId: 'settings', label: 'Settings',      iconName: '⚙️', iconMediaUrl: undefined, showOnDesktop: true,  showInDock: false, showInMenu: true, showInSearch: true, desktopPosition: { x: 20, y: 650 }, dockPosition: 9 },
    ]
  }
  async getOwner(): Promise<PortfolioOwner> {
    return PORTFOLIO_DATA.owner as unknown as PortfolioOwner
  }

  async getProjects(): Promise<ProjectData[]> {
    return PORTFOLIO_DATA.projects as unknown as ProjectData[]
  }

  async getProject(slug: string): Promise<ProjectData | null> {
    return (
      (PORTFOLIO_DATA.projects.find(p => p.slug === slug) as unknown as ProjectData) || null
    )
  }

  async getExperience(): Promise<ExperienceData[]> {
    return PORTFOLIO_DATA.experiences as unknown as ExperienceData[]
  }

  async getEducation(): Promise<EducationData[]> {
    return PORTFOLIO_DATA.education as unknown as EducationData[]
  }

  async getCertificates(): Promise<CertificateData[]> {
    return PORTFOLIO_DATA.certificates as unknown as CertificateData[]
  }

  async getTestimonials(): Promise<TestimonialData[]> {
    return []
  }

  async getBlogPosts(): Promise<BlogPostData[]> {
    return []
  }

  async getSiteSettings(): Promise<SiteSettings> {
    return {
      siteName:     'ALLINET OS',
      defaultTheme: 'cyber-gold',
      logoText:     'A',
    }
  }

  async getSkills(): Promise<SkillData[]> {
    const colorMap: Record<string, string> = {
      frontend: '#61dafb',
      backend:  '#68a063',
      ai:       '#d4af37',
      devops:   '#2496ed',
      db:       '#336791',
    }
    return (
      PORTFOLIO_DATA.technologies as unknown as Array<{
        name: string
        proficiency: number
        category: string
      }>
    ).map(t => ({
      name:     t.name,
      level:    Math.round((t.proficiency / 5) * 100),
      category: t.category,
      color:    colorMap[t.category] ?? '#a78bfa',
    }))
  }

  async getFullContextPayload(): Promise<any> {
    return PORTFOLIO_DATA
  }
}
