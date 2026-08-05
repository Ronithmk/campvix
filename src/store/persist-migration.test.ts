import { beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
})

describe('auth-store persist migration', () => {
  it('logs out a pre-v1 persisted session instead of trusting its stale shape', async () => {
    localStorage.setItem(
      'campusflow-auth',
      JSON.stringify({ state: { isAuthenticated: true, role: 'administrator', personId: null, schoolId: 'school-1' }, version: 0 }),
    )
    const { useAuthStore } = await import('./auth-store')
    // zustand persist rehydrates synchronously for a localStorage-backed
    // store, so by the time the module finishes importing, migrate has run.
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().role).toBeNull()
  })

  it('keeps a current-version persisted session intact', async () => {
    localStorage.setItem(
      'campusflow-auth',
      JSON.stringify({
        state: { isAuthenticated: true, role: 'teacher', name: 'Test Teacher', email: 't@x.com', avatarUrl: '', personId: 'teacher-1', schoolId: 'school-1', managesMultipleSchools: false },
        version: 1,
      }),
    )
    const { useAuthStore } = await import('./auth-store')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().role).toBe('teacher')
  })
})

describe('permissions-store persist migration', () => {
  it('replaces a pre-v1 persisted permission map with fresh defaults', async () => {
    localStorage.setItem(
      'campusflow-permissions',
      JSON.stringify({ state: { permissions: { teacher: ['/app/dashboard'] } }, version: 0 }),
    )
    const { usePermissionsStore } = await import('./permissions-store')
    // The stale map has no action:lms:create key at all — a naive merge
    // would leave teacher without it. Migration must replace, not merge.
    expect(usePermissionsStore.getState().hasAccess('teacher', 'action:lms:create')).toBe(true)
  })
})
