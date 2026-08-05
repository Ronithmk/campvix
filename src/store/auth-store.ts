import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role } from '@/types'
import { schools } from '@/mock/schools'
import { DEMO_ACCOUNTS, demoAccountForRole, findDemoAccount, type DemoAccount } from '@/mock/demo-accounts'

interface AuthState {
  isAuthenticated: boolean
  name: string
  email: string
  avatarUrl: string
  role: Role | null
  /** id of the underlying student/teacher/parent/staff record this session represents, if any */
  personId: string | null
  schoolId: string | null
  /** true for roles that manage multiple schools (admin/principal) */
  managesMultipleSchools: boolean
  loginWithCredentials: (email: string, password: string) => boolean
  loginAsRole: (role: Role) => void
  setSchool: (schoolId: string) => void
  logout: () => void
}

function applyAccount(account: DemoAccount) {
  return {
    isAuthenticated: true,
    name: account.name,
    email: account.email,
    avatarUrl: account.avatarUrl,
    role: account.role,
    personId: account.personId,
    schoolId: account.schoolId,
    managesMultipleSchools: account.role === 'administrator' || account.role === 'principal',
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      name: '',
      email: '',
      avatarUrl: '',
      role: null,
      personId: null,
      schoolId: schools[0].id,
      managesMultipleSchools: false,
      loginWithCredentials: (email, password) => {
        const account = findDemoAccount(email, password)
        if (!account) return false
        set(applyAccount(account))
        return true
      },
      loginAsRole: (role) => {
        set(applyAccount(demoAccountForRole(role)))
      },
      setSchool: (schoolId) => set({ schoolId }),
      logout: () => set({ isAuthenticated: false, role: null, personId: null }),
    }),
    {
      name: 'campusflow-auth',
      version: 1,
      // A stale session shape from before a breaking change (e.g. a field the
      // current session-building logic depends on) is safer forced back to
      // logged-out than trusted as-is — one extra login beats silently broken state.
      // Returning {} lets zustand's default merge fall through entirely to the
      // store's fresh initial state (logged out).
      migrate: (persisted, version) => (version < 1 ? ({} as AuthState) : (persisted as AuthState)),
    },
  ),
)

export { DEMO_ACCOUNTS }
