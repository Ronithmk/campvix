import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SubjectsPage from './subjects'
import { subjects as mockSubjects } from '@/mock/subjects'
import { teachers } from '@/mock/teachers'

beforeEach(() => {
  localStorage.clear()
})

describe('SubjectsPage — rendering', () => {
  it('renders the full subject catalog', () => {
    render(<SubjectsPage />)
    expect(screen.getByRole('heading', { name: /^subjects$/i })).toBeInTheDocument()
    for (const subject of mockSubjects) {
      expect(screen.getByText(subject.name)).toBeInTheDocument()
    }
  })

  it('shows the teacher assignment count matching the underlying mock data', () => {
    render(<SubjectsPage />)
    const subject = mockSubjects[0]
    const assignedCount = teachers.filter((t) => t.subjects.includes(subject.name)).length

    expect(screen.getByText(new RegExp(`${assignedCount} teachers? assigned`, 'i'))).toBeInTheDocument()
  })
})

describe('SubjectsPage — delete flow', () => {
  it('removes a subject card after confirming delete', async () => {
    const user = userEvent.setup()
    render(<SubjectsPage />)
    const target = mockSubjects[0]

    const nameEl = screen.getByText(target.name)
    const card = nameEl.closest('[data-slot="card"]') as HTMLElement
    await user.click(within(card).getByRole('button'))

    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText(/delete this subject\?/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(target.name)).not.toBeInTheDocument()
  })

  it('keeps the subject card when delete is cancelled', async () => {
    const user = userEvent.setup()
    render(<SubjectsPage />)
    const target = mockSubjects[1]

    const nameEl = screen.getByText(target.name)
    const card = nameEl.closest('[data-slot="card"]') as HTMLElement
    await user.click(within(card).getByRole('button'))

    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }))

    expect(screen.getByText(target.name)).toBeInTheDocument()
  })
})
