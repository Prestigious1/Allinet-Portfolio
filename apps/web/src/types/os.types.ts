export type AppId =
  | 'about'
  | 'projects'
  | 'resume'
  | 'skills'
  | 'terminal'
  | 'ai'
  | 'contact'
  | 'github'
  | 'blog'
  | 'gallery'
  | 'settings'
  | 'explorer'
  | 'achievements'
  | 'education'
  | 'certificates'
  | 'testimonials'
  | 'timeline'
  | 'music'

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface WindowInstance {
  id: string
  appId: AppId
  title: string
  isMinimized: boolean
  isMaximized: boolean
  position: Position
  size: Size
  zIndex: number
  props?: Record<string, any>
}

export interface DesktopIcon {
  id: string
  appId: AppId
  label: string
  icon?: string
  position: Position
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: number
}

export type Theme = 'cyber-gold' | 'midnight' | 'matrix' | 'ice-station' | 'void'
