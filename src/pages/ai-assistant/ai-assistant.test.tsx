import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AiAssistantPage from './ai-assistant'
import { useAuthStore } from '@/store/auth-store'
import { schools } from '@/mock/schools'
import { students } from '@/mock/students'
import { feeRecords } from '@/mock/fees'

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
  useAuthStore.setState({ schoolId: schools[0].id })
})

describe('AiAssistantPage', () => {
  it('renders a welcome message for the active school', () => {
    render(<AiAssistantPage />)
    expect(screen.getByText(new RegExp(`at ${schools[0].name}`, 'i'))).toBeInTheDocument()
  })

  it('answers a student-count question with the real filtered student count', async () => {
    const user = userEvent.setup()
    render(<AiAssistantPage />)

    const schoolStudents = students.filter((s) => s.schoolId === schools[0].id)
    await user.click(screen.getByRole('button', { name: /how many students are enrolled/i }))

    expect(await screen.findByText(new RegExp(`${schoolStudents.length} students enrolled`, 'i'))).toBeInTheDocument()
  })

  it('answers a fee question with the real outstanding total for the school', async () => {
    const user = userEvent.setup()
    render(<AiAssistantPage />)

    const schoolFees = feeRecords.filter((f) => f.schoolId === schools[0].id)
    const unpaidCount = schoolFees.filter((f) => f.status !== 'paid').length

    await user.click(screen.getByRole('button', { name: /pending fee amount/i }))

    // The reply's currency figure uses Indian-locale comma grouping (formatCurrency),
    // so assert on the plain unpaid-invoice count instead of the formatted amount.
    expect(await screen.findByText(new RegExp(`across ${unpaidCount} unpaid invoices`, 'i'))).toBeInTheDocument()
  })

  it('lets the user type and send a free-form question', async () => {
    const user = userEvent.setup()
    render(<AiAssistantPage />)

    const input = screen.getByPlaceholderText(/ask campusflow ai anything/i)
    await user.type(input, 'What is the attendance today?{Enter}')

    expect(await screen.findByText('What is the attendance today?')).toBeInTheDocument()
    expect(await screen.findByText(/attendance is running at/i)).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('hides the suggestion chips once a conversation has started', async () => {
    const user = userEvent.setup()
    render(<AiAssistantPage />)
    expect(screen.getByRole('button', { name: /how many students are enrolled/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /show revenue growth this month/i }))

    expect(screen.queryByRole('button', { name: /how many students are enrolled/i })).not.toBeInTheDocument()
  })
})
