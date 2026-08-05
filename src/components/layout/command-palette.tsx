import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, GraduationCap, Wallet, Calendar, Settings, LogOut, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command'
import { useUiStore } from '@/store/ui-store'

export function CommandPalette() {
  const open = useUiStore((s) => s.commandPaletteOpen)
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen)
  const navigate = useNavigate()
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, setOpen])

  function go(path: string) {
    navigate(path)
    setOpen(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, students, teachers..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go('/app/dashboard')}>
            <LayoutDashboard /> Dashboard
            <CommandShortcut>D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go('/app/students')}>
            <Users /> Students
          </CommandItem>
          <CommandItem onSelect={() => go('/app/teachers')}>
            <GraduationCap /> Teachers
          </CommandItem>
          <CommandItem onSelect={() => go('/app/finance/fees')}>
            <Wallet /> Fee Management
          </CommandItem>
          <CommandItem onSelect={() => go('/app/calendar')}>
            <Calendar /> Calendar
          </CommandItem>
          <CommandItem onSelect={() => go('/app/settings')}>
            <Settings /> Settings
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
            {resolvedTheme === 'dark' ? <Sun /> : <Moon />} Toggle theme
          </CommandItem>
          <CommandItem onSelect={() => go('/login')} className="text-destructive">
            <LogOut /> Log out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
