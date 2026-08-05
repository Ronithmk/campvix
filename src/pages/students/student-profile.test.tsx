import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import StudentProfilePage from './student-profile'
import { students } from '@/mock/students'
import { parents } from '@/mock/parents'

function renderProfile(studentId: string) {
  return render(
    <MemoryRouter initialEntries={[`/app/students/${studentId}`]}>
      <Routes>
        <Route path="/app/students/:studentId" element={<StudentProfilePage />} />
        <Route path="/app/students" element={<div>Students list page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('StudentProfilePage', () => {
  it('shows an empty state for an unknown student id', () => {
    renderProfile('student-does-not-exist')
    expect(screen.getByText(/student not found/i)).toBeInTheDocument()
  })

  it('renders the student details matching the underlying mock record', () => {
    const student = students[0]
    renderProfile(student.id)

    expect(screen.getByRole('heading', { name: student.name })).toBeInTheDocument()
    expect(screen.getByText(new RegExp(student.admissionNo))).toBeInTheDocument()
    expect(screen.getByText(student.gpa.toFixed(1))).toBeInTheDocument()
    expect(screen.getByText(`${student.attendancePercent}%`)).toBeInTheDocument()
    expect(screen.getByText(student.email)).toBeInTheDocument()
  })

  it('shows the linked parent on the family tab', async () => {
    const user = userEvent.setup()
    const student = students[0]
    const parent = parents.find((p) => p.id === student.parentId)!
    renderProfile(student.id)

    await user.click(screen.getByRole('tab', { name: /parent & medical/i }))
    expect(await screen.findByText(parent.name)).toBeInTheDocument()
  })

  it('removes the student and navigates back to the students list on confirmed delete', async () => {
    const user = userEvent.setup()
    const student = students[1]
    renderProfile(student.id)

    await user.click(screen.getByRole('button', { name: /remove student/i }))
    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText(/remove this student\?/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(await screen.findByText('Students list page')).toBeInTheDocument()
  })

  it('keeps the student page when delete is cancelled', async () => {
    const user = userEvent.setup()
    const student = students[2]
    renderProfile(student.id)

    await user.click(screen.getByRole('button', { name: /remove student/i }))
    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }))

    expect(screen.getByRole('heading', { name: student.name })).toBeInTheDocument()
  })
})
