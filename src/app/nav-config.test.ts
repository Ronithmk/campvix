import { describe, expect, it } from 'vitest'
import { ACTION_PERMISSION_SECTIONS, NAV_SECTIONS, findNavItemForPath, getAllActionPermissions, getAllNavItems, getNavForRole } from './nav-config'

describe('getNavForRole', () => {
  it('falls back to item.roles when no allowedUrls override is given', () => {
    const sections = getNavForRole('student')
    const urls = sections.flatMap((s) => s.items.map((i) => i.url))
    expect(urls).toContain('/app/dashboard')
    expect(urls).not.toContain('/app/finance/payroll')
  })

  it('uses allowedUrls exclusively when provided, ignoring item.roles', () => {
    const sections = getNavForRole('student', ['/app/dashboard'])
    const urls = sections.flatMap((s) => s.items.map((i) => i.url))
    expect(urls).toEqual(['/app/dashboard'])
  })

  it('drops sections that end up with zero visible items', () => {
    const sections = getNavForRole('student', [])
    expect(sections).toHaveLength(0)
  })

  it('returns every section unfiltered when role is null', () => {
    expect(getNavForRole(null)).toEqual(NAV_SECTIONS)
  })
})

describe('getAllNavItems', () => {
  it('flattens every section into one list matching the total item count', () => {
    const total = NAV_SECTIONS.reduce((sum, s) => sum + s.items.length, 0)
    expect(getAllNavItems()).toHaveLength(total)
  })
})

describe('findNavItemForPath', () => {
  it('finds an exact match', () => {
    expect(findNavItemForPath('/app/dashboard')?.url).toBe('/app/dashboard')
  })

  it('finds the longest-prefix match for a detail route', () => {
    expect(findNavItemForPath('/app/students/student-12')?.url).toBe('/app/students')
  })

  it('returns undefined for a path with no registered nav entry', () => {
    expect(findNavItemForPath('/app/totally-unregistered-route')).toBeUndefined()
  })
})

describe('getAllActionPermissions', () => {
  it('flattens every action permission section into one list', () => {
    const total = ACTION_PERMISSION_SECTIONS.reduce((sum, s) => sum + s.items.length, 0)
    expect(getAllActionPermissions()).toHaveLength(total)
  })

  it('includes the LMS and Gallery create-action keys', () => {
    const keys = getAllActionPermissions().map((a) => a.key)
    expect(keys).toContain('action:lms:create')
    expect(keys).toContain('action:gallery:create')
  })
})
