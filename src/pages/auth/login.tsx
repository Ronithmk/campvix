import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  ShieldCheck,
  Landmark,
  GraduationCap as TeacherIcon,
  User,
  Users,
  Calculator,
  UsersRound,
  Bus,
  LibraryBig,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { AuthLayout } from '@/layouts/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useAuthStore } from '@/store/auth-store'
import { sleep } from '@/lib/utils'
import type { Role } from '@/types'
import { ROLE_LABELS } from '@/types'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginValues = z.infer<typeof loginSchema>

const ROLE_ICONS: Record<Role, LucideIcon> = {
  administrator: ShieldCheck,
  principal: Landmark,
  teacher: TeacherIcon,
  accountant: Calculator,
  receptionist: Users,
  student: User,
  parent: UsersRound,
  driver: Bus,
  librarian: LibraryBig,
}

const QUICK_ACCESS_ROLES: Role[] = ['administrator', 'teacher', 'student', 'parent']
const MORE_ROLES: Role[] = ['principal', 'accountant', 'receptionist', 'driver', 'librarian']

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [pendingRole, setPendingRole] = useState<Role | null>(null)
  const loginAsRole = useAuthStore((s) => s.loginAsRole)
  const loginWithCredentials = useAuthStore((s) => s.loginWithCredentials)
  const navigate = useNavigate()

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@campusflow.app', password: 'demo1234' },
  })

  function afterLogin() {
    const { managesMultipleSchools, name } = useAuthStore.getState()
    toast.success(`Welcome, ${name.split(' ')[0]}!`)
    navigate(managesMultipleSchools ? '/choose-school' : '/app/dashboard')
  }

  async function onSubmit(values: LoginValues) {
    await sleep(500)
    const ok = loginWithCredentials(values.email, values.password)
    if (!ok) {
      form.setError('password', { message: 'Invalid email or password' })
      return
    }
    afterLogin()
  }

  async function handleQuickLogin(role: Role) {
    setPendingRole(role)
    await sleep(400)
    loginAsRole(role)
    setPendingRole(null)
    afterLogin()
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your CampusFlow workspace">
      <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">Quick access</p>
      <div className="mb-4 grid grid-cols-2 gap-2.5">
        {QUICK_ACCESS_ROLES.map((role) => {
          const Icon = ROLE_ICONS[role]
          return (
            <button
              key={role}
              type="button"
              disabled={pendingRole !== null}
              onClick={() => handleQuickLogin(role)}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-60"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {pendingRole === role ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4" />}
              </div>
              <span className="text-sm font-medium text-foreground">{ROLE_LABELS[role]}</span>
            </button>
          )
        })}
      </div>

      {showMore ? (
        <div className="mb-4 grid grid-cols-2 gap-2.5">
          {MORE_ROLES.map((role) => {
            const Icon = ROLE_ICONS[role]
            return (
              <button
                key={role}
                type="button"
                disabled={pendingRole !== null}
                onClick={() => handleQuickLogin(role)}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-60"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {pendingRole === role ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4" />}
                </div>
                <span className="text-sm font-medium text-foreground">{ROLE_LABELS[role]}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <button type="button" onClick={() => setShowMore(true)} className="mb-4 text-xs font-medium text-primary hover:underline">
          Show more roles (Principal, Accountant, Receptionist, Driver, Librarian)
        </button>
      )}

      <div className="mb-5 rounded-lg bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
        Each role signs in as a real, restricted account. Manual sign-in works too — every demo account uses password <span className="font-medium text-foreground">demo1234</span>.
      </div>

      <div className="mb-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or sign in manually</span>
        <Separator className="flex-1" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input placeholder="you@school.edu" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <FormControl>
                    <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password" {...field} />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-2">
            <Checkbox id="remember" defaultChecked />
            <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
              Keep me signed in for 30 days
            </Label>
          </div>

          <Button type="submit" size="lg" className="mt-1 w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
            Sign in
          </Button>
        </form>
      </Form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        New to CampusFlow?{' '}
        <a href="#" className="font-medium text-primary hover:underline">
          Request a demo
        </a>
      </p>
    </AuthLayout>
  )
}
