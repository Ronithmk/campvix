import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SubjectsPage from './subjects'
import { subjects as mockSubjects } from '@/mock/subjects'
import { teachers } from '@/mock/teachers'
import { schools } from '@/mock/schools'
import { useAuthStore } from '@/store/auth-store'

beforeEach(() => {
  localStorage.clear()
  useAuthStore.setState({ schoolId: schools[0].id })
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
    const assignedCount = teachers.filter((t) => t.schoolId === schools[0].id && t.subjects.includes(subject.name)).length

    const card = screen.getByText(subject.name).closest('[data-slot="card"]') as HTMLElement
    expect(within(card).getByText(new RegExp(`${assignedCount} teachers? assigned`, 'i'))).toBeInTheDocument()
  })

  it('recomputes the teacher assignment count after switching the active school', () => {
    const subject = mockSubjects[0]
    const countForSchool = (schoolId: string) => teachers.filter((t) => t.schoolId === schoolId && t.subjects.includes(subject.name)).length

    const { rerender } = render(<SubjectsPage />)
    let card = screen.getByText(subject.name).closest('[data-slot="card"]') as HTMLElement
    expect(within(card).getByText(new RegExp(`${countForSchool(schools[0].id)} teachers? assigned`, 'i'))).toBeInTheDocument()

    useAuthStore.setState({ schoolId: schools[1].id })
    rerender(<SubjectsPage />)
    card = screen.getByText(subject.name).closest('[data-slot="card"]') as HTMLElement
    expect(within(card).getByText(new RegExp(`${countForSchool(schools[1].id)} teachers? assigned`, 'i'))).toBeInTheDocument()
  })
})

describe('SubjectsPage — creates a new subject', () => {
  it('adds a new subject card to the catalog', async () => {
    const user = userEvent.setup()
    render(<SubjectsPage />)

    await user.click(screen.getByRole('button', { name: 'Add Subject' }))
    await user.type(screen.getByLabelText(/subject name/i), 'Economics')
    await user.type(screen.getByLabelText(/code/i), 'eco')
    await user.click(screen.getByRole('button', { name: 'Add subject' }))

    expect(await screen.findByText('Economics')).toBeInTheDocument()
    const card = screen.getByText('Economics').closest('[data-slot="card"]') as HTMLElement
    expect(within(card).getByText('ECO')).toBeInTheDocument()
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
