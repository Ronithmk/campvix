import { describe, expect, it } from 'vitest'
import { DEMO_ACCOUNTS, demoAccountForRole, findDemoAccount } from './demo-accounts'
import { parents } from './parents'
import { ROLES } from '@/types'

describe('findDemoAccount', () => {
  it('returns the matching account for correct email + password', () => {
    const account = findDemoAccount('admin@campusflow.app', 'demo1234')
    expect(account?.role).toBe('administrator')
  })

  it('is case-insensitive and trims the email', () => {
    const account = findDemoAccount('  ADMIN@campusflow.app  ', 'demo1234')
    expect(account?.role).toBe('administrator')
  })

  it('returns undefined for a wrong password', () => {
    expect(findDemoAccount('admin@campusflow.app', 'wrong')).toBeUndefined()
  })

  it('returns undefined for an unknown email', () => {
    expect(findDemoAccount('nobody@campusflow.app', 'demo1234')).toBeUndefined()
  })
})

describe('demoAccountForRole', () => {
  it('returns the account for every role in ROLES', () => {
    for (const role of ROLES) {
      expect(demoAccountForRole(role).role).toBe(role)
    }
  })

  it('throws instead of silently falling back to administrator for an unknown role', () => {
    // @ts-expect-error deliberately passing a role outside the Role union to prove the guard
    expect(() => demoAccountForRole('superadmin')).toThrow(/No demo account configured/)
  })
})

describe('DEMO_ACCOUNTS', () => {
  it('has exactly one account per role, all sharing the demo password', () => {
    expect(DEMO_ACCOUNTS).toHaveLength(ROLES.length)
    for (const account of DEMO_ACCOUNTS) {
      expect(account.password).toBe('demo1234')
    }
  })

  it('links the student and parent demo accounts to the same family', () => {
    const student = DEMO_ACCOUNTS.find((a) => a.role === 'student')!
    const parent = DEMO_ACCOUNTS.find((a) => a.role === 'parent')!
    const parentRecord = parents.find((p) => p.id === parent.personId)
    expect(parentRecord?.childrenIds).toContain(student.personId)
  })
})
