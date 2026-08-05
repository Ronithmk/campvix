import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TeachersListPage from './teachers-list'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { teachers as mockTeachers } from '@/mock/teachers'
import { formatNumber } from '@/lib/utils'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
})

const schoolId = () => useAuthStore.getState().schoolId!

describe('TeachersListPage — rendering and stats', () => {
  it('renders for administrator', () => {
    render(<TeachersListPage />)
    expect(screen.getByRole('heading', { name: /teachers/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add teacher/i })).toBeInTheDocument()
  })

  it('shows stat cards matching the underlying mock data', () => {
    render(<TeachersListPage />)
    const schoolTeachers = mockTeachers.filter((t) => t.schoolId === schoolId())
    const active = schoolTeachers.filter((t) => t.status === 'active').length
    const onLeave = schoolTeachers.filter((t) => t.status === 'on_leave').length
    const avgPerformance = Math.round(schoolTeachers.reduce((sum, t) => sum + t.performanceScore, 0) / schoolTeachers.length)

    expect(screen.getByText('Total Teachers', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(formatNumber(schoolTeachers.length))
    expect(screen.getByText('Active', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(formatNumber(active))
    expect(screen.getByText('On Leave', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(formatNumber(onLeave))
    expect(screen.getByText('Avg. Performance', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(`${avgPerformance}/100`)
  })
})

describe('TeachersListPage — filter', () => {
  it('filters rows down by status', async () => {
    const user = userEvent.setup()
    render(<TeachersListPage />)
    const expectedCount = mockTeachers.filter((t) => t.schoolId === schoolId() && t.status === 'on_leave').length

    await user.click(screen.getAllByRole('combobox')[0])
    await user.click(await screen.findByRole('option', { name: /^on leave$/i }))

    expect(await screen.findByText(new RegExp(`showing \\d+ of ${expectedCount} rows`, 'i'))).toBeInTheDocument()
  })
})

describe('TeachersListPage — Add Teacher button is a stub', () => {
  it('does not add a row when clicked (known UI stub, not real form logic)', async () => {
    const user = userEvent.setup()
    render(<TeachersListPage />)
    const before = mockTeachers.filter((t) => t.schoolId === schoolId()).length

    await user.click(screen.getByRole('button', { name: /add teacher/i }))

    expect(screen.getByText('Total Teachers', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(formatNumber(before))
  })
})

describe('TeachersListPage — delete flow', () => {
  it('removes the teacher row after confirming delete', async () => {
    const user = userEvent.setup()
    render(<TeachersListPage />)
    const target = mockTeachers.find((t) => t.schoolId === schoolId())!

    const nameCell = screen.getByText(target.name)
    const row = nameCell.closest('tr')!
    await user.click(within(row).getByRole('button'))
    await user.click(await screen.findByRole('menuitem', { name: /remove teacher/i }))

    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText(/remove this teacher\?/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(target.name)).not.toBeInTheDocument()
  })
})
