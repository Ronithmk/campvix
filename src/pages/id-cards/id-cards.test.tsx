import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IdCardsPage from './id-cards'
import { useAuthStore } from '@/store/auth-store'
import { schools } from '@/mock/schools'
import { students } from '@/mock/students'
import { teachers } from '@/mock/teachers'
import { classes } from '@/mock/classes'

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
  useAuthStore.setState({ schoolId: schools[0].id })
})

describe('IdCardsPage', () => {
  it('renders without crashing and defaults to the student tab', () => {
    render(<IdCardsPage />)
    expect(screen.getByText(/design and bulk-generate id cards/i)).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /students/i })).toHaveAttribute('data-state', 'active')
  })

  it('shows the correct ready-card count for students (capped at 12) for the active school', () => {
    render(<IdCardsPage />)
    const schoolStudents = students.filter((s) => s.schoolId === schools[0].id)
    const expected = Math.min(schoolStudents.length, 12)
    expect(screen.getByText(`${expected} cards ready`)).toBeInTheDocument()
  })

  it('switches to teacher cards and shows the correct ready-card count', async () => {
    const user = userEvent.setup()
    render(<IdCardsPage />)
    const schoolTeachers = teachers.filter((t) => t.schoolId === schools[0].id)
    const expected = Math.min(schoolTeachers.length, 12)

    await user.click(screen.getByRole('tab', { name: /teachers/i }))

    expect(screen.getByText(`${expected} cards ready`)).toBeInTheDocument()
  })

  it('filters student cards by class', async () => {
    const user = userEvent.setup()
    render(<IdCardsPage />)
    const schoolClasses = classes.filter((c) => c.schoolId === schools[0].id)
    const targetClass = schoolClasses[0]
    const inClass = students.filter((s) => s.schoolId === schools[0].id && s.classId === targetClass.id).slice(0, 12)

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: targetClass.name }))

    expect(screen.getByText(`${inClass.length} cards ready`)).toBeInTheDocument()
    if (inClass.length) expect(screen.getByText(inClass[0].name)).toBeInTheDocument()
  })
})
