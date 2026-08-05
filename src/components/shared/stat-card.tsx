import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  change?: number
  changeLabel?: string
  icon: LucideIcon
  accent?: 'primary' | 'accent' | 'warning' | 'destructive'
  index?: number
}

const ACCENT_STYLES: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent text-accent-foreground',
  warning: 'bg-warning-bg text-warning',
  destructive: 'bg-destructive/10 text-destructive',
}

export function StatCard({ label, value, change, changeLabel, icon: Icon, accent = 'primary', index = 0 }: StatCardProps) {
  const isPositive = (change ?? 0) >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
    >
      <Card className="group transition-shadow hover:shadow-md">
        <CardContent className="flex items-start justify-between gap-4 py-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-xs font-medium">
                <span className={cn('flex items-center gap-0.5', isPositive ? 'text-success' : 'text-destructive')}>
                  {isPositive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                  {Math.abs(change)}%
                </span>
                <span className="text-muted-foreground">{changeLabel ?? 'vs last month'}</span>
              </div>
            )}
          </div>
          <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105', ACCENT_STYLES[accent])}>
            <Icon className="size-5" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
