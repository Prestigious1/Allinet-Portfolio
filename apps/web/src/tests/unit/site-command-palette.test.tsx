import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SiteCommandPalette } from '@/components/site/SiteCommandPalette'

// Mock next/navigation useRouter
const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

describe('TASK-P11-02: Public Site Command Palette Modal', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    pushMock.mockReset()
  })

  it('initially does not render when closed', () => {
    render(<SiteCommandPalette />)
    expect(screen.queryByRole('dialog', { name: /Site Command Palette/i })).not.toBeInTheDocument()
  })

  it('opens on Cmd+K or Ctrl+K shortcut and closes on Escape', async () => {
    render(<SiteCommandPalette />)

    // Trigger Cmd+K
    fireEvent.keyDown(window, { key: 'k', metaKey: true })

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /Site Command Palette/i })).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText(/Type a command or search/i)
    expect(input).toBeInTheDocument()

    // Trigger Escape
    fireEvent.keyDown(input, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /Site Command Palette/i })).not.toBeInTheDocument()
    })
  })

  it('opens on custom event "open-site-command-palette"', async () => {
    render(<SiteCommandPalette />)

    window.dispatchEvent(new CustomEvent('open-site-command-palette'))

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /Site Command Palette/i })).toBeInTheDocument()
    })
  })

  it('closes on backdrop click', async () => {
    const onClose = vi.fn()
    const { rerender } = render(<SiteCommandPalette isOpen={true} onClose={onClose} />)

    expect(screen.getByRole('dialog', { name: /Site Command Palette/i })).toBeInTheDocument()

    const backdrop = document.getElementById('site-command-palette-backdrop')
    expect(backdrop).toBeInTheDocument()

    fireEvent.click(backdrop!)
    expect(onClose).toHaveBeenCalled()

    rerender(<SiteCommandPalette isOpen={false} onClose={onClose} />)
    expect(screen.queryByRole('dialog', { name: /Site Command Palette/i })).not.toBeInTheDocument()
  })

  it('filters commands when typing in search input', async () => {
    render(<SiteCommandPalette isOpen={true} />)

    const input = screen.getByPlaceholderText(/Type a command or search/i)
    fireEvent.change(input, { target: { value: 'brief' } })

    await waitFor(() => {
      expect(screen.getByText(/Project Brief & Proposal Generator/i)).toBeInTheDocument()
    })
  })

  it('navigates with Up and Down arrows and executes on Enter', async () => {
    render(<SiteCommandPalette isOpen={true} />)

    const input = screen.getByPlaceholderText(/Type a command or search/i)
    fireEvent.change(input, { target: { value: 'projects' } })

    await waitFor(() => {
      expect(screen.getByText(/Projects & Case Studies/i)).toBeInTheDocument()
    })

    // Press Down arrow
    fireEvent.keyDown(input, { key: 'ArrowDown' })

    // Press Enter to execute command
    fireEvent.keyDown(input, { key: 'Enter' })

    // Verify navigation was triggered
    expect(pushMock).toHaveBeenCalledWith('/projects')
  })

  it('executes command when clicking an option', async () => {
    render(<SiteCommandPalette isOpen={true} />)

    const input = screen.getByPlaceholderText(/Type a command or search/i)
    fireEvent.change(input, { target: { value: 'contact' } })

    await waitFor(() => {
      expect(screen.getByText(/Contact & Consultation/i)).toBeInTheDocument()
    })

    const contactOption = screen.getByText(/Contact & Consultation/i)
    fireEvent.click(contactOption)

    expect(pushMock).toHaveBeenCalledWith('/contact')
  })
})
