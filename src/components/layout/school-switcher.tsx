import { toast } from 'sonner'
import { Building2, Check, ChevronsUpDown, Plus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store/auth-store'
import { useActiveSchool } from '@/hooks/use-active-school'
import { schools } from '@/mock/schools'
import { cn } from '@/lib/utils'

const PLAN_LABEL: Record<string, string> = { starter: 'Starter', growth: 'Growth', enterprise: 'Enterprise' }

export function SchoolSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const school = useActiveSchool()
  const setSchool = useAuthStore((s) => s.setSchool)

  function handleSelect(id: string) {
    if (id === school.id) return
    const target = schools.find((s) => s.id === id)
    setSchool(id)
    toast.success(`Switched to ${target?.name}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center gap-2.5 rounded-lg px-2 py-1.5 outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring/30',
          collapsed ? 'justify-center' : 'w-full',
        )}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: school.primaryColor }}>
          <Building2 className="size-4.5" />
        </div>
        {!collapsed && (
          <>
            <div className="flex min-w-0 flex-1 flex-col text-left">
              <span className="truncate text-[13px] font-semibold text-white">{school.name}</span>
              <span className="truncate text-[11px] text-sidebar-muted">{PLAN_LABEL[school.plan]} plan</span>
            </div>
            <ChevronsUpDown className="size-3.5 shrink-0 text-sidebar-muted" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>Your schools</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {schools.map((s) => (
          <DropdownMenuItem key={s.id} onSelect={() => handleSelect(s.id)}>
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md text-white" style={{ background: s.primaryColor }}>
              <Building2 className="size-3.5" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm text-foreground">{s.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {s.city} &middot; {s.studentCount.toLocaleString()} students
              </span>
            </div>
            {s.id === school.id && <Check className="size-4 shrink-0 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => toast.info('Add school flow coming soon')}>
          <Plus /> Add a school
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
