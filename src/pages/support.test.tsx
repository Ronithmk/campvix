import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SupportPage from './support'

beforeEach(() => {
  localStorage.clear()
})

describe('SupportPage', () => {
  it('renders without crashing and shows all FAQs by default', () => {
    render(<SupportPage />)
    expect(screen.getByText(/how do i add a new student/i)).toBeInTheDocument()
    expect(screen.getByText(/how can i record a fee payment/i)).toBeInTheDocument()
    expect(screen.getByText(/how do i export data to csv/i)).toBeInTheDocument()
  })

  it('filters FAQs by the search box', async () => {
    const user = userEvent.setup()
    render(<SupportPage />)

    await user.type(screen.getByPlaceholderText(/search help articles/i), 'CSV')

    expect(screen.getByText(/how do i export data to csv/i)).toBeInTheDocument()
    expect(screen.queryByText(/how do i add a new student/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/how can i record a fee payment/i)).not.toBeInTheDocument()
  })

  it('shows validation errors instead of submitting when the contact form is empty', async () => {
    const user = userEvent.setup()
    render(<SupportPage />)

    await user.click(screen.getByRole('tab', { name: /contact us/i }))
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(await screen.findByText('Subject is required')).toBeInTheDocument()
    expect(await screen.findByText(/please provide more detail/i)).toBeInTheDocument()
  })

  it('submits and resets the contact form when valid', async () => {
    const user = userEvent.setup()
    render(<SupportPage />)

    await user.click(screen.getByRole('tab', { name: /contact us/i }))
    const subjectInput = screen.getByLabelText(/subject/i)
    const messageInput = screen.getByLabelText(/message/i)
    await user.type(subjectInput, 'Login issue')
    await user.type(messageInput, 'I cannot log in to my account since this morning.')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    // form.reset() clears the fields once the (600ms) submit handler resolves.
    await waitFor(() => expect(subjectInput).toHaveValue(''), { timeout: 2000 })
    expect(messageInput).toHaveValue('')
  })
})
