import { useNavigate } from 'react-router-dom'
import { Building2, ChevronRight, MapPin, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { AuthLayout } from '@/layouts/auth-layout'
import { Badge } from '@/components/ui/badge'
import { schools } from '@/mock/schools'
import { useAuthStore } from '@/store/auth-store'
import { cn } from '@/lib/utils'

const PLAN_LABEL: Record<string, string> = { starter: 'Starter', growth: 'Growth', enterprise: 'Enterprise' }

export default function ChooseSchoolPage() {
  const navigate = useNavigate()
  const setSchool = useAuthStore((s) => s.setSchool)
  const schoolId = useAuthStore((s) => s.schoolId)

  function handleSelect(id: string) {
    setSchool(id)
    navigate('/app/dashboard')
  }

  return (
    <AuthLayout title="Choose your school" subtitle="Select which campus workspace you'd like to access">
      <div className="flex flex-col gap-3">
        {schools.map((school, i) => (
          <motion.button
            key={school.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            onClick={() => handleSelect(school.id)}
            className={cn(
              'flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-md',
              schoolId === school.id && 'border-primary ring-1 ring-primary/30',
            )}
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: school.primaryColor }}>
              <Building2 className="size-5" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-sm font-semibold text-foreground">{school.name}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" /> {school.city}, {school.country} &middot; {school.studentCount.toLocaleString()} students
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {PLAN_LABEL[school.plan]}
            </Badge>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </motion.button>
        ))}

        <button className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border p-4 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
          <Plus className="size-4" /> Add a new school
        </button>
      </div>
    </AuthLayout>
  )
}
