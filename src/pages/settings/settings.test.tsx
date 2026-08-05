import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SettingsPage from './settings'
import { usePermissionsStore } from '@/store/permissions-store'
import { ROLES } from '@/types'

const EDITABLE_ROLES = ROLES.filter((r) => r !== 'administrator')

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
})

async function openPermissionsTab() {
  const user = userEvent.setup()
  render(<SettingsPage />)
  await user.click(screen.getByRole('tab', { name: /role permissions/i }))
  await screen.findByRole('table')
  return user
}

/** Locate the checkbox for a given (module/action row label, role) cell in the matrix table. */
function checkboxFor(rowLabel: string, role: string) {
  const row = screen.getByText(rowLabel).closest('tr')!
  const roleIndex = EDITABLE_ROLES.indexOf(role as (typeof EDITABLE_ROLES)[number])
  return within(row).getAllByRole('checkbox')[roleIndex]
}

describe('SettingsPage — static tabs', () => {
  it('renders the School tab by default without crashing', () => {
    render(<SettingsPage />)
    expect(screen.getByText('School information')).toBeInTheDocument()
  })
})

describe('SettingsPage — Role Permissions matrix', () => {
  it('renders a matrix row for every nav module and action permission', async () => {
    await openPermissionsTab()
    expect(screen.getByText('Payroll')).toBeInTheDocument()
    expect(screen.getByText('Create Course')).toBeInTheDocument()
  })

  it('grants a role page access when its checkbox is checked, backed by the permissions store', async () => {
    const user = await openPermissionsTab()
    expect(usePermissionsStore.getState().hasAccess('student', '/app/finance/payroll')).toBe(false)

    const checkbox = checkboxFor('Payroll', 'student')
    expect(checkbox).not.toBeChecked()
    await user.click(checkbox)

    expect(usePermissionsStore.getState().hasAccess('student', '/app/finance/payroll')).toBe(true)
    expect(checkbox).toBeChecked()
  })

  it('revokes a role page access when its checkbox is unchecked, backed by the permissions store', async () => {
    const user = await openPermissionsTab()
    expect(usePermissionsStore.getState().hasAccess('teacher', '/app/dashboard')).toBe(true)

    const checkbox = checkboxFor('Dashboard', 'teacher')
    expect(checkbox).toBeChecked()
    await user.click(checkbox)

    expect(usePermissionsStore.getState().hasAccess('teacher', '/app/dashboard')).toBe(false)
    expect(checkbox).not.toBeChecked()
  })

  it('toggles an action permission (not just page access) the same way', async () => {
    const user = await openPermissionsTab()
    expect(usePermissionsStore.getState().hasAccess('teacher', 'action:lms:create')).toBe(true)

    const checkbox = checkboxFor('Create Course', 'teacher')
    await user.click(checkbox)

    expect(usePermissionsStore.getState().hasAccess('teacher', 'action:lms:create')).toBe(false)
  })

  it('only toggles the clicked role, leaving other roles on the same row untouched', async () => {
    const user = await openPermissionsTab()
    const teacherBefore = usePermissionsStore.getState().hasAccess('teacher', '/app/finance/payroll')

    await user.click(checkboxFor('Payroll', 'student'))

    expect(usePermissionsStore.getState().hasAccess('teacher', '/app/finance/payroll')).toBe(teacherBefore)
  })

  it('always shows the administrator column as checked and disabled', async () => {
    await openPermissionsTab()
    const row = screen.getByText('Dashboard').closest('tr')!
    const checkboxes = within(row).getAllByRole('checkbox')
    const adminCheckbox = checkboxes[checkboxes.length - 1]

    expect(adminCheckbox).toBeChecked()
    expect(adminCheckbox).toBeDisabled()
  })

  it(
    'restores a toggled-off permission when Reset to defaults is clicked',
    async () => {
      const user = await openPermissionsTab()
      const checkbox = checkboxFor('Create Course', 'teacher')

      await user.click(checkbox)
      expect(usePermissionsStore.getState().hasAccess('teacher', 'action:lms:create')).toBe(false)

      await user.click(screen.getByRole('button', { name: /reset to defaults/i }))

      expect(usePermissionsStore.getState().hasAccess('teacher', 'action:lms:create')).toBe(true)
      expect(checkboxFor('Create Course', 'teacher')).toBeChecked()
    },
    15000,
  )
})
