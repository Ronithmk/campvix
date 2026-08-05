import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TeacherDashboard } from './teacher-dashboard'
import { teachers } from '@/mock/teachers'
import { classes } from '@/mock/classes'
import { students } from '@/mock/students'
import { schools } from '@/mock/schools'

const realTeacher = teachers[0]
const school = schools.find((s) => s.id === realTeacher.schoolId)!

function renderDashboard(personId: string) {
  return render(
    <MemoryRouter>
      <TeacherDashboard personId={personId} name="Test Teacher" school={school} />
    </MemoryRouter>,
  )
}

describe('TeacherDashboard', () => {
  it('shows the "record not found" empty state for an unknown personId', () => {
    renderDashboard('nonexistent-id')
    expect(screen.getByText('Teacher record not found')).toBeInTheDocument()
  })

  it('renders a personalized greeting and subjects/school in the description', () => {
    renderDashboard(realTeacher.id)
    expect(screen.getByText('Good morning, Test')).toBeInTheDocument()
  })

  it("shows the teacher's real class count and performance score", () => {
    renderDashboard(realTeacher.id)
    const myClasses = classes.filter((c) => c.classTeacherId === realTeacher.id)
    const myStudentCount = students.filter((s) => myClasses.some((c) => c.id === s.classId)).length

    expect(screen.getByText('My Classes')).toBeInTheDocument()
    expect(screen.getByText(String(myClasses.length))).toBeInTheDocument()
    expect(screen.getByText(String(myStudentCount))).toBeInTheDocument()
    expect(screen.getByText(String(realTeacher.performanceScore))).toBeInTheDocument()
  })

  it('lists the classes this teacher is assigned to, not another teacher’s', () => {
    renderDashboard(realTeacher.id)
    const myClasses = classes.filter((c) => c.classTeacherId === realTeacher.id)
    if (myClasses.length === 0) {
      expect(screen.getByText('You are not assigned as a class teacher.')).toBeInTheDocument()
    } else {
      expect(screen.getByText(myClasses[0].name)).toBeInTheDocument()
    }
  })
})
