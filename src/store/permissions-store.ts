import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { NAV_SECTIONS } from '@/app/nav-config'
import { ROLES, type Role } from '@/types'

export type PermissionMap = Record<Role, string[]>

function buildDefaultPermissions(): PermissionMap {
  const map = Object.fromEntries(ROLES.map((role) => [role, [] as string[]])) as PermissionMap
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      for (const role of item.roles) {
        map[role].push(item.url)
      }
    }
  }
  return map
}

const DEFAULT_PERMISSIONS = buildDefaultPermissions()

interface PermissionsState {
  permissions: PermissionMap
  hasAccess: (role: Role, url: string) => boolean
  toggleAccess: (role: Role, url: string) => void
  resetToDefaults: () => void
}

export const usePermissionsStore = create<PermissionsState>()(
  persist(
    (set, get) => ({
      permissions: DEFAULT_PERMISSIONS,
      hasAccess: (role, url) => {
        if (role === 'administrator') return true
        return get().permissions[role]?.includes(url) ?? false
      },
      toggleAccess: (role, url) =>
        set((state) => {
          const current = state.permissions[role] ?? []
          const next = current.includes(url) ? current.filter((u) => u !== url) : [...current, url]
          return { permissions: { ...state.permissions, [role]: next } }
        }),
      resetToDefaults: () => set({ permissions: DEFAULT_PERMISSIONS }),
    }),
    { name: 'campusflow-permissions' },
  ),
)
