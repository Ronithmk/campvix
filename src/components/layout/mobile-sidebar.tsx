import { NavLink } from 'react-router-dom'
import { getNavForRole } from '@/app/nav-config'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SchoolSwitcher } from '@/components/layout/school-switcher'
import { cn } from '@/lib/utils'

export function MobileSidebar({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const role = useAuthStore((s) => s.role)
  const allowedUrls = usePermissionsStore((s) => (role ? s.permissions[role] : undefined))
  const sections = getNavForRole(role, allowedUrls)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 bg-sidebar border-sidebar-border p-0 text-sidebar-foreground">
        <SheetHeader className="border-b border-sidebar-border py-3">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SchoolSwitcher />
        </SheetHeader>
        <ScrollArea className="h-[calc(100svh-4.5rem)] px-3">
          <nav className="flex flex-col gap-5 py-3 pb-6">
            {sections.map((section) => (
              <div key={section.title} className="flex flex-col gap-1">
                <p className="px-2.5 pb-1 text-[11px] font-medium tracking-wider text-sidebar-muted uppercase">{section.title}</p>
                {section.items.map((item) => (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    onClick={() => onOpenChange(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                        isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                      )
                    }
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
