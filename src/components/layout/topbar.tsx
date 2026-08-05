import { useState } from 'react'
import { Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { NotificationsPanel } from '@/components/layout/notifications-panel'
import { ProfileMenu } from '@/components/layout/profile-menu'
import { MobileSidebar } from '@/components/layout/mobile-sidebar'
import { useUiStore } from '@/store/ui-store'

export function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const setCommandPaletteOpen = useUiStore((s) => s.setCommandPaletteOpen)

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
        <Menu className="size-5" />
      </Button>

      <div className="hidden md:block">
        <Breadcrumbs />
      </div>

      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="ml-auto flex h-9 w-full max-w-xs items-center gap-2 rounded-lg border border-input bg-secondary/60 px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary sm:max-w-sm"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search students, teachers, pages...</span>
        <span className="inline sm:hidden">Search</span>
        <kbd className="ml-auto hidden items-center gap-0.5 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">⌘K</kbd>
      </button>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificationsPanel />
        <div className="mx-1 h-6 w-px bg-border" />
        <ProfileMenu />
      </div>

      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />
    </header>
  )
}
