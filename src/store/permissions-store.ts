import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { NAV_SECTIONS, ACTION_PERMISSION_SECTIONS } from '@/app/nav-config'
import { ROLES, type Role } from '@/types'

/**
 * One flat set of granted permission strings per role. A key is either a page
 * URL (from NAV_SECTIONS, e.g. "/app/lms") or an action key (from
 * ACTION_PERMISSION_SECTIONS, e.g. "action:lms:create") — hasAccess treats
 * both identically, so page access and action-level gating share one
 * admin-editable system instead of two.
 */
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
  for (const section of ACTION_PERMISSION_SECTIONS) {
    for (const item of section.items) {
      for (const role of item.roles) {
        map[role].push(item.key)
      }
    }
  }
  return map
}

const DEFAULT_PERMISSIONS = buildDefaultPermissions()

interface PermissionsState {
  permissions: PermissionMap
  /** url is a page URL or an action key — both live in the same permission set */
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
    {
      name: 'campusflow-permissions',
      version: 1,
      // A persisted permission map from before a shape change (e.g. new keys
      // NAV_SECTIONS didn't have yet) can't safely merge with the new default —
      // an admin's old customizations are less costly to lose than serving a
      // map that's silently missing keys for newly gated modules/actions.
      migrate: (_persisted, version) => (version < 1 ? ({ permissions: DEFAULT_PERMISSIONS } as PermissionsState) : (_persisted as PermissionsState)),
    },
  ),
)
