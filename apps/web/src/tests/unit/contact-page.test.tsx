import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ContactPage from '@/app/(site)/contact/page'
import { ContactForm } from '@/components/site/ContactForm'

describe('TASK-P5-07: Contact Page & Form', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders contact page with heading, form, and sidebar quick links', () => {
    render(<ContactPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByLabelText(/Contact form/i)).toBeInTheDocument()
    expect(screen.getByText(/Prefer a Call\?/i)).toBeInTheDocument()
    expect(screen.getByText(/Have a Full Project\?/i)).toBeInTheDocument()
  })

  it('renders form elements with proper accessibility attributes', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/What do you need\?/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Send message/i })).toBeInTheDocument()
  })

  it('displays validation errors when submitting empty form', async () => {
    render(<ContactForm />)
    const submitBtn = screen.getByRole('button', { name: /Send message/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Name must be at least 2 characters/i)).toBeInTheDocument()
    })
  })

  it('submits form successfully and displays confirmation message', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          success: true,
          message: 'Thank you for your enquiry! We will respond within 24 hours.',
        },
      }),
    } as any)

    render(<ContactForm />)

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'Amaka Okonkwo' },
    })
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'amaka@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/What do you need\?/i), {
      target: { value: 'We need a robust enterprise booking platform with automated WhatsApp notifications.' },
    })
    fireEvent.click(screen.getByLabelText(/I agree to ALLINET/i))

    const submitBtn = screen.getByRole('button', { name: /Send message/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/Thank you for your enquiry/i)
    })
  })
})
