import { schools } from './schools'

export interface SchoolRosterConfig {
  schoolId: string
  teacherCount: number
  studentCount: number
  parentCount: number
  staffScale: number
  sectionsPerGrade: number
}

export const SCHOOL_ROSTER_CONFIG: SchoolRosterConfig[] = [
  { schoolId: schools[0].id, teacherCount: 30, studentCount: 500, parentCount: 100, staffScale: 1, sectionsPerGrade: 2 },
  { schoolId: schools[1].id, teacherCount: 16, studentCount: 220, parentCount: 45, staffScale: 0.5, sectionsPerGrade: 2 },
  { schoolId: schools[2].id, teacherCount: 8, studentCount: 90, parentCount: 20, staffScale: 0.3, sectionsPerGrade: 1 },
]

export function configFor(schoolId: string): SchoolRosterConfig {
  return SCHOOL_ROSTER_CONFIG.find((c) => c.schoolId === schoolId) ?? SCHOOL_ROSTER_CONFIG[0]
}
