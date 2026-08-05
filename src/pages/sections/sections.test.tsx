import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SectionsPage from './sections'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { classes as allClasses } from '@/mock/classes'
import type { SchoolClass } from '@/types'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
})

const schoolId = () => useAuthStore.getState().schoolId!

function computeExpected() {
  const classes = allClasses.filter((c) => c.schoolId === schoolId())
  const grouped = new Map<string, SchoolClass[]>()
  for (const c of classes) {
    const grade = c.name.split(' - ')[0]
    grouped.set(grade, [...(grouped.get(grade) ?? []), c])
  }
  const imbalanced = Array.from(grouped.values()).filter((secs) => {
    const strengths = secs.map((s) => s.strength)
    return Math.max(...strengths) - Math.min(...strengths) > 8
  }).length
  return { classes, grouped, imbalanced }
}

describe('SectionsPage — rendering and stats', () => {
  it('renders for administrator', () => {
    render(<SectionsPage />)
    expect(screen.getByRole('heading', { name: /sections/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add section/i })).toBeInTheDocument()
  })

  it('shows stat cards matching the grouping computed from the underlying mock data', () => {
    render(<SectionsPage />)
    const { classes, grouped, imbalanced } = computeExpected()

    expect(screen.getByText('Total Sections', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(classes.length))
    expect(screen.getByText('Grades Covered', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(grouped.size))
    expect(screen.getByText('Imbalanced Grades', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(imbalanced))
  })

  it('renders a card per grade with the correct section count', () => {
    render(<SectionsPage />)
    const { grouped } = computeExpected()
    const [grade, sections] = Array.from(grouped.entries())[0]

    const gradeTitle = screen.getByText(grade)
    const card = gradeTitle.closest('[data-slot="card"]') as HTMLElement
    expect(within(card).getByText(`${sections.length} sections`)).toBeInTheDocument()
  })
})

describe('SectionsPage — creates a new section', () => {
  it('adds a new grade+section combination and updates the section stats', async () => {
    const user = userEvent.setup()
    render(<SectionsPage />)
    const { classes: before } = computeExpected()

    await user.click(screen.getByRole('button', { name: 'Add Section' }))
    await user.type(screen.getByLabelText(/grade/i), 'Grade 11')
    await user.type(screen.getByLabelText(/section letter/i), 'C')
    const strengthInput = screen.getByLabelText(/starting strength/i)
    await user.clear(strengthInput)
    await user.type(strengthInput, '25')
    await user.click(screen.getByRole('button', { name: 'Add section' }))

    const gradeCard = (await screen.findByText('Grade 11')).closest('[data-slot="card"]') as HTMLElement
    expect(within(gradeCard).getByText('1 sections')).toBeInTheDocument()
    expect(within(gradeCard).getByText('25')).toBeInTheDocument()
    expect(screen.getByText('Total Sections', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(before.length + 1))
  })
})
