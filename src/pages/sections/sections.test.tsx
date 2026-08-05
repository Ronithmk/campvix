import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
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
