import { NavLink } from 'react-router-dom'
import { ChevronsLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { getNavForRole } from '@/app/nav-config'
import { useAuthStore } from '@/store/auth-store'
import { useUiStore } from '@/store/ui-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SchoolSwitcher } from '@/components/layout/school-switcher'
import { cn } from '@/lib/utils'
import { ROLE_LABELS } from '@/types'

export function Sidebar() {
  const role = useAuthStore((s) => s.role)
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const allowedUrls = usePermissionsStore((s) => (role ? s.permissions[role] : undefined))
  const sections = getNavForRole(role, allowedUrls)

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="sticky top-0 hidden h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex"
    >
      <div className={cn('flex h-16 shrink-0 items-center px-3', collapsed && 'justify-center px-0')}>
        <SchoolSwitcher collapsed={collapsed} />
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="flex flex-col gap-5 pb-4">
          {sections.map((section) => (
            <div key={section.title} className="flex flex-col gap-1">
              {!collapsed && <p className="px-2.5 pb-1 text-[11px] font-medium tracking-wider text-sidebar-muted uppercase">{section.title}</p>}
              {section.items.map((item) => {
                const link = (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                        collapsed && 'justify-center px-0 py-2.5',
                        isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                      )
                    }
                  >
                    <item.icon className="size-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.title}</span>}
                  </NavLink>
                )

                if (!collapsed) return link

                return (
                  <Tooltip key={item.url}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className={cn('flex items-center gap-2 border-t border-sidebar-border p-3', collapsed && 'justify-center')}>
        {!collapsed && role && (
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-xs font-medium text-white">{ROLE_LABELS[role]}</span>
            <span className="truncate text-[11px] text-sidebar-muted">Signed in</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-white"
          aria-label="Toggle sidebar"
        >
          <ChevronsLeft className={cn('size-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>
    </motion.aside>
  )
}
