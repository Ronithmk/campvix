import { beforeEach, describe, expect, it } from 'vitest'
import { usePermissionsStore } from './permissions-store'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
})

describe('hasAccess', () => {
  it('always returns true for administrator regardless of the stored map', () => {
    expect(usePermissionsStore.getState().hasAccess('administrator', '/app/finance/payroll')).toBe(true)
  })

  it('returns true for a role granted a url by default', () => {
    expect(usePermissionsStore.getState().hasAccess('teacher', '/app/dashboard')).toBe(true)
  })

  it('returns false for a role not granted a url', () => {
    expect(usePermissionsStore.getState().hasAccess('student', '/app/finance/payroll')).toBe(false)
  })

  it('checks action keys the same way as page urls', () => {
    expect(usePermissionsStore.getState().hasAccess('teacher', 'action:lms:create')).toBe(true)
    expect(usePermissionsStore.getState().hasAccess('student', 'action:lms:create')).toBe(false)
  })
})

describe('toggleAccess', () => {
  it('adds a url to a role that did not have it', () => {
    const { toggleAccess, hasAccess } = usePermissionsStore.getState()
    expect(hasAccess('student', '/app/finance/payroll')).toBe(false)
    toggleAccess('student', '/app/finance/payroll')
    expect(usePermissionsStore.getState().hasAccess('student', '/app/finance/payroll')).toBe(true)
  })

  it('removes a url from a role that had it', () => {
    const { toggleAccess } = usePermissionsStore.getState()
    expect(usePermissionsStore.getState().hasAccess('teacher', 'action:lms:create')).toBe(true)
    toggleAccess('teacher', 'action:lms:create')
    expect(usePermissionsStore.getState().hasAccess('teacher', 'action:lms:create')).toBe(false)
  })

  it('only affects the toggled role, not others', () => {
    usePermissionsStore.getState().toggleAccess('student', '/app/finance/payroll')
    expect(usePermissionsStore.getState().hasAccess('parent', '/app/finance/payroll')).toBe(false)
  })
})

describe('resetToDefaults', () => {
  it('restores a toggled-off permission', () => {
    const { toggleAccess, resetToDefaults } = usePermissionsStore.getState()
    toggleAccess('teacher', 'action:lms:create')
    expect(usePermissionsStore.getState().hasAccess('teacher', 'action:lms:create')).toBe(false)
    resetToDefaults()
    expect(usePermissionsStore.getState().hasAccess('teacher', 'action:lms:create')).toBe(true)
  })
})
