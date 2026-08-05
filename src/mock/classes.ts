import { faker } from '@faker-js/faker'
import type { SchoolClass } from '@/types'
import { teachers } from './teachers'
import { SCHOOL_ROSTER_CONFIG } from './school-roster-config'

faker.seed(102)

const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
const SECTION_LETTERS = ['A', 'B']

let globalIndex = 0

export const classes: SchoolClass[] = SCHOOL_ROSTER_CONFIG.flatMap((config) => {
  const schoolTeachers = teachers.filter((t) => t.schoolId === config.schoolId)
  const sections = SECTION_LETTERS.slice(0, config.sectionsPerGrade)
  const avgStrength = Math.max(6, Math.round(config.studentCount / (GRADES.length * sections.length)))

  return GRADES.flatMap((grade, gi) =>
    sections.map((section, si) => {
      const localIndex = gi * sections.length + si
      const teacher = schoolTeachers[localIndex % schoolTeachers.length]
      const record: SchoolClass = {
        id: `class-${globalIndex + 1}`,
        schoolId: config.schoolId,
        name: `Grade ${grade} - ${section}`,
        sections: [section],
        classTeacherId: teacher.id,
        strength: faker.number.int({ min: Math.max(4, avgStrength - 4), max: avgStrength + 6 }),
        room: `${faker.number.int({ min: 1, max: 4 })}${String.fromCharCode(65 + (localIndex % 6))}-${faker.number.int({ min: 100, max: 320 })}`,
      }
      globalIndex += 1
      return record
    }),
  )
})
