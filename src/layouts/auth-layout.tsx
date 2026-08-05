import type { ReactNode } from 'react'
import { GraduationCap, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const HIGHLIGHTS = [
  { icon: Zap, text: 'Real-time attendance, fees, and academic insights in one place' },
  { icon: ShieldCheck, text: 'Enterprise-grade security with granular role-based access' },
  { icon: Sparkles, text: 'AI-assisted reporting across every campus you manage' },
]

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="grid min-h-svh w-full lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.35),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.25),transparent_50%)]" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="size-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">CampusFlow</span>
        </div>

        <div className="relative flex flex-col gap-8">
          <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-md text-3xl font-semibold leading-tight tracking-tight">
            The command center for modern school operations.
          </motion.h2>
          <div className="flex flex-col gap-4">
            {HIGHLIGHTS.map((h, i) => (
              <motion.div
                key={h.text}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm"
              >
                <h.icon className="mt-0.5 size-4.5 shrink-0 text-primary-hover" />
                <p className="text-sm text-slate-200">{h.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-400">Trusted by 480+ schools worldwide &middot; SOC 2 Type II compliant</p>
      </div>

      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-sm">
          <div className="mb-8 flex flex-col gap-1.5 lg:hidden">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="size-4.5" />
              </div>
              <span className="text-base font-semibold tracking-tight">CampusFlow</span>
            </div>
          </div>
          <div className="mb-7 flex flex-col gap-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  )
}
