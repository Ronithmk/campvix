import { useAuthStore } from '@/store/auth-store'
import { schools } from '@/mock/schools'

export function useActiveSchoolId(): string {
  const schoolId = useAuthStore((s) => s.schoolId)
  return schoolId ?? schools[0].id
}

export function useActiveSchool() {
  const schoolId = useActiveSchoolId()
  return schools.find((s) => s.id === schoolId) ?? schools[0]
}
