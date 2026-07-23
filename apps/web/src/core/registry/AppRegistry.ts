import type React from 'react'

export interface OSAppConfig {
  id: string
  title: string
  icon: string
  component: React.ComponentType
  
  // OS Capabilities
  canMaximize?: boolean
  canMinimize?: boolean
  canFullscreen?: boolean
  canPin?: boolean
  isSearchable?: boolean
  
  // Default bounds
  defaultWidth?: number
  defaultHeight?: number
  
  // Shortcuts
  keyboardShortcut?: string
}

class ApplicationRegistry {
  private static instance: ApplicationRegistry
  private apps: Map<string, OSAppConfig> = new Map()

  private constructor() {}

  public static getInstance(): ApplicationRegistry {
    if (!ApplicationRegistry.instance) {
      ApplicationRegistry.instance = new ApplicationRegistry()
    }
    return ApplicationRegistry.instance
  }

  public register(config: OSAppConfig) {
    if (this.apps.has(config.id)) {
      console.warn(`[AppRegistry] App with id ${config.id} is already registered. Overwriting.`)
    }
    this.apps.set(config.id, {
      canMaximize: true,
      canMinimize: true,
      canFullscreen: false,
      canPin: true,
      isSearchable: true,
      defaultWidth: 800,
      defaultHeight: 600,
      ...config
    })
  }

  public getApp(id: string): OSAppConfig | undefined {
    return this.apps.get(id)
  }

  public getAllApps(): OSAppConfig[] {
    return Array.from(this.apps.values())
  }
}

export const appRegistry = ApplicationRegistry.getInstance()

// Utility decorator-like function to register an app alongside its component
export function createOSApp(config: Omit<OSAppConfig, 'component'>, component: React.ComponentType): React.ComponentType {
  appRegistry.register({
    ...config,
    component
  })
  return component
}
