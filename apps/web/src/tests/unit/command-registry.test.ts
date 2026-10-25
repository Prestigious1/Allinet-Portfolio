import { describe, it, expect, vi } from 'vitest'
import {
  getAllCommands,
  getCommandsByGroup,
  searchCommands,
  registerCommand,
  CommandItem,
} from '@/core/commands/registry'

describe('TASK-P11-01: Shared Command Registry', () => {
  it('returns all built-in commands across required groups', () => {
    const commands = getAllCommands()
    expect(commands.length).toBeGreaterThanOrEqual(15)

    const navigation = getCommandsByGroup('Navigation')
    expect(navigation.length).toBeGreaterThanOrEqual(10)

    const actions = getCommandsByGroup('Actions')
    expect(actions.length).toBeGreaterThanOrEqual(5)

    const system = getCommandsByGroup('System')
    expect(system.length).toBeGreaterThanOrEqual(1)

    const external = getCommandsByGroup('External')
    expect(external.length).toBeGreaterThanOrEqual(3)
  })

  it('contains all required public site navigation commands', () => {
    const ids = getAllCommands().map((c) => c.id)

    expect(ids).toContain('nav-home')
    expect(ids).toContain('nav-projects')
    expect(ids).toContain('nav-demos')
    expect(ids).toContain('nav-brief')
    expect(ids).toContain('nav-recruiter')
    expect(ids).toContain('nav-client')
    expect(ids).toContain('nav-founder')
    expect(ids).toContain('nav-services')
    expect(ids).toContain('nav-process')
    expect(ids).toContain('nav-now')
    expect(ids).toContain('nav-contact')
    expect(ids).toContain('nav-concierge')
  })

  it('PARITY TEST: contains all OS theme actions without omission', () => {
    const ids = getAllCommands().map((c) => c.id)

    expect(ids).toContain('action-theme-cyber')
    expect(ids).toContain('action-theme-midnight')
    expect(ids).toContain('action-theme-matrix')
    expect(ids).toContain('action-theme-ice')
    expect(ids).toContain('action-theme-void')
  })

  it('performs fuzzy and keyword-weighted search correctly', () => {
    // Exact search
    const briefResults = searchCommands('brief')
    expect(briefResults.length).toBeGreaterThan(0)
    expect(briefResults[0].id).toBe('nav-brief')

    // Keyword match: "cv" matches both recruiter and download-cv
    const cvResults = searchCommands('cv')
    const cvIds = cvResults.map((c) => c.id)
    expect(cvIds).toContain('action-download-cv')
    expect(cvIds).toContain('nav-recruiter')

    // Theme search
    const themeResults = searchCommands('theme')
    expect(themeResults.length).toBeGreaterThanOrEqual(5)

    // Empty query returns all commands
    const allResults = searchCommands('')
    expect(allResults.length).toBe(getAllCommands().length)
  })

  it('supports custom dynamic command registration and execution', () => {
    const runMock = vi.fn()
    const customCommand: CommandItem = {
      id: 'custom-test-action',
      title: 'Custom Test Action',
      keywords: ['test', 'custom', 'mock'],
      group: 'Actions',
      icon: '🧪',
      run: runMock,
    }

    registerCommand(customCommand)

    const searchResult = searchCommands('custom test')
    expect(searchResult.map((c) => c.id)).toContain('custom-test-action')

    const found = searchResult.find((c) => c.id === 'custom-test-action')
    found?.run()
    expect(runMock).toHaveBeenCalled()
  })

  it('respects the when() condition to conditionally hide commands', () => {
    const conditionalCommand: CommandItem = {
      id: 'conditional-action',
      title: 'Conditional Secret Action',
      keywords: ['secret'],
      group: 'Actions',
      icon: '🔒',
      run: () => {},
      when: (ctx) => ctx?.isAdmin === true,
    }

    registerCommand(conditionalCommand)

    // Hidden when condition is not satisfied
    const hidden = searchCommands('secret', { isAdmin: false })
    expect(hidden.map((c) => c.id)).not.toContain('conditional-action')

    // Visible when condition is satisfied
    const visible = searchCommands('secret', { isAdmin: true })
    expect(visible.map((c) => c.id)).toContain('conditional-action')
  })
})
