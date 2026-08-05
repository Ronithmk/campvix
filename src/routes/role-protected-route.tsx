import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { findNavItemForPath } from '@/app/nav-config'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'

export function RoleProtectedRoute() {
  const role = useAuthStore((s) => s.role)
  const location = useLocation()
  const hasAccess = usePermissionsStore((s) => s.hasAccess)

  const navItem = findNavItemForPath(location.pathname)
  const denied = !!(role && (!navItem || !hasAccess(role, navItem.url)))

  useEffect(() => {
    if (!denied) return
    toast.error(navItem ? `Your role doesn't have access to ${navItem.title}` : "You don't have access to that page")
  }, [denied, navItem])

  if (denied) return <Navigate to="/app/dashboard" replace />

  return <Outlet />
}
