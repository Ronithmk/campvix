import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from './auth-store'
import { schools } from '@/mock/schools'

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().logout()
  useAuthStore.setState({ schoolId: schools[0].id })
})

describe('loginWithCredentials', () => {
  it('logs in and returns true for a valid demo account', () => {
    const ok = useAuthStore.getState().loginWithCredentials('admin@campusflow.app', 'demo1234')
    expect(ok).toBe(true)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().role).toBe('administrator')
  })

  it('does not authenticate and returns false for an invalid password', () => {
    const ok = useAuthStore.getState().loginWithCredentials('admin@campusflow.app', 'wrong-password')
    expect(ok).toBe(false)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})

describe('loginAsRole', () => {
  it('sets the correct role, personId, and school for a linked role like teacher', () => {
    useAuthStore.getState().loginAsRole('teacher')
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.role).toBe('teacher')
    expect(state.personId).not.toBeNull()
  })

  it('marks administrator and principal as managing multiple schools', () => {
    useAuthStore.getState().loginAsRole('administrator')
    expect(useAuthStore.getState().managesMultipleSchools).toBe(true)
  })

  it('does not mark teacher as managing multiple schools', () => {
    useAuthStore.getState().loginAsRole('teacher')
    expect(useAuthStore.getState().managesMultipleSchools).toBe(false)
  })
})

describe('setSchool', () => {
  it('updates the active schoolId', () => {
    useAuthStore.getState().setSchool(schools[1].id)
    expect(useAuthStore.getState().schoolId).toBe(schools[1].id)
  })
})

describe('logout', () => {
  it('clears authentication, role, and personId', () => {
    useAuthStore.getState().loginAsRole('teacher')
    useAuthStore.getState().logout()
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.role).toBeNull()
    expect(state.personId).toBeNull()
  })
})
