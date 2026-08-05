import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ParentDashboard } from './parent-dashboard'
import { parents } from '@/mock/parents'
import { students } from '@/mock/students'
import { schools } from '@/mock/schools'

const realParent = parents.find((p) => p.childrenIds.length > 0)!
const school = schools.find((s) => s.id === realParent.schoolId)!

function renderDashboard(personId: string) {
  return render(
    <MemoryRouter>
      <ParentDashboard personId={personId} name="Test Parent" school={school} />
    </MemoryRouter>,
  )
}

describe('ParentDashboard', () => {
  it('shows the "no linked children" empty state for an unknown personId', () => {
    renderDashboard('nonexistent-id')
    expect(screen.getByText('No linked children found')).toBeInTheDocument()
  })

  it('renders a welcome message with the real children count', () => {
    renderDashboard(realParent.id)
    const children = students.filter((s) => realParent.childrenIds.includes(s.id))
    expect(screen.getByText(`Welcome, Test`)).toBeInTheDocument()
    expect(screen.getByText('Children Enrolled')).toBeInTheDocument()
    expect(screen.getByText(String(children.length))).toBeInTheDocument()
  })

  it("shows each real child's name and class/section", () => {
    renderDashboard(realParent.id)
    const children = students.filter((s) => realParent.childrenIds.includes(s.id))
    for (const child of children) {
      expect(screen.getByText(child.name)).toBeInTheDocument()
    }
  })
})
