import { test, expect } from '@playwright/test'

test.describe('ALLINET OS Desktop Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Skip boot sequence and intro scene instantly for deterministic tests
    await page.addInitScript(() => {
      sessionStorage.setItem('allinet-booted', 'true')
    })

    // Navigate to OS desktop
    await page.goto('/')

    // Wait for the desktop shell toolbar to be visible
    await page.waitForSelector('[role="toolbar"][aria-label="Application Dock"]', { timeout: 30000 })
  })

  test('renders desktop shell, dock, and taskbar', async ({ page }) => {
    // Verify Taskbar
    const taskbar = page.locator('[role="navigation"][aria-label="OS Taskbar"]')
    await expect(taskbar).toBeVisible()

    // Verify Dock
    const dock = page.locator('[role="toolbar"][aria-label="Application Dock"]')
    await expect(dock).toBeVisible()
  })

  test('can open and close Terminal application', async ({ page }) => {
    // Find Terminal button on desktop or menuitem in dock
    const terminalButton = page.getByRole('button', { name: /terminal/i }).first()
    await terminalButton.click()

    // Verify window opened
    const terminalWindow = page.locator('[role="dialog"]').filter({ hasText: /Terminal/i }).first()
    await expect(terminalWindow).toBeVisible({ timeout: 15000 })

    // Close window via traffic light close button
    const closeBtn = terminalWindow.locator('button[aria-label*="Close"]').first()
    await closeBtn.click()

    // Verify window closed
    await expect(terminalWindow).not.toBeVisible({ timeout: 10000 })
  })

  test('can open and close Projects application', async ({ page }) => {
    // Find Projects button on desktop or dock
    const projectsButton = page.getByRole('button', { name: /projects/i }).first()
    await projectsButton.click()

    // Verify window opened
    const projectsWindow = page.locator('[role="dialog"]').filter({ hasText: /Projects/i }).first()
    await expect(projectsWindow).toBeVisible({ timeout: 15000 })

    // Close window via traffic light close button
    const closeBtn = projectsWindow.locator('button[aria-label*="Close"]').first()
    await closeBtn.click()

    // Verify window closed
    await expect(projectsWindow).not.toBeVisible({ timeout: 10000 })
  })

  test('can open and close AI Assistant application', async ({ page }) => {
    // Find AI button on desktop or dock
    const aiButton = page.getByRole('button', { name: /\bai\b|aion/i }).first()
    await aiButton.click()

    // Verify window opened
    const aiWindow = page.locator('[role="dialog"]').filter({ hasText: /AI|AION/i }).first()
    await expect(aiWindow).toBeVisible({ timeout: 15000 })

    // Close window via traffic light close button
    const closeBtn = aiWindow.locator('button[aria-label*="Close"]').first()
    await closeBtn.click()

    // Verify window closed
    await expect(aiWindow).not.toBeVisible({ timeout: 10000 })
  })
})
