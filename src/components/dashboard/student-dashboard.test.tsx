import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StudentDashboard } from './student-dashboard'
import { students } from '@/mock/students'
import { results, exams } from '@/mock/exams'
import { schools } from '@/mock/schools'

const realStudent = students[0]
const school = schools.find((s) => s.id === realStudent.schoolId)!

function renderDashboard(personId: string) {
  return render(
    <MemoryRouter>
      <StudentDashboard personId={personId} name="Test Student" school={school} />
    </MemoryRouter>,
  )
}

describe('StudentDashboard', () => {
  it('shows the "record not found" empty state for an unknown personId', () => {
    renderDashboard('nonexistent-id')
    expect(screen.getByText('Student record not found')).toBeInTheDocument()
  })

  it('renders a personalized greeting and the class/section for a real student', () => {
    renderDashboard(realStudent.id)
    expect(screen.getByText(`Good morning, Test`)).toBeInTheDocument()
    expect(screen.getByText(`${realStudent.className} - ${realStudent.section} · ${school.name}`)).toBeInTheDocument()
  })

  it("shows the student's real attendance percent and GPA in the stat cards", () => {
    renderDashboard(realStudent.id)
    expect(screen.getByText(`${realStudent.attendancePercent}%`)).toBeInTheDocument()
    expect(screen.getByText(realStudent.gpa.toFixed(1))).toBeInTheDocument()
  })

  it("lists the student's own exam results, not another student's", () => {
    renderDashboard(realStudent.id)
    const myResults = results.filter((r) => r.studentId === realStudent.id).slice(0, 5)
    if (myResults.length === 0) {
      expect(screen.getByText('No results recorded yet.')).toBeInTheDocument()
    } else {
      const exam = exams.find((e) => e.id === myResults[0].examId)
      expect(screen.getByText(exam!.name)).toBeInTheDocument()
    }
  })
})
