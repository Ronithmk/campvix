import { faker } from '@faker-js/faker'
import type { Teacher } from '@/types'
import { subjects } from './subjects'
import { SCHOOL_ROSTER_CONFIG } from './school-roster-config'

faker.seed(101)

const QUALIFICATIONS = ['B.Ed', 'M.Ed', 'M.Sc', 'M.A', 'Ph.D', 'B.Sc, B.Ed']
const STATUSES: Teacher['status'][] = ['active', 'active', 'active', 'active', 'on_leave', 'inactive']

const slots = SCHOOL_ROSTER_CONFIG.flatMap((config) => Array.from({ length: config.teacherCount }, () => config.schoolId))

export const teachers: Teacher[] = slots.map((schoolId, i) => {
  const gender = faker.helpers.arrayElement(['male', 'female'] as const)
  const name = faker.person.fullName({ sex: gender })
  const subjectPicks = faker.helpers.arrayElements(subjects, { min: 1, max: 3 }).map((s) => s.name)

  return {
    id: `teacher-${i + 1}`,
    schoolId,
    employeeId: `EMP-${String(1000 + i)}`,
    name,
    avatarUrl: faker.image.avatarGitHub(),
    gender,
    email: faker.internet.email({ firstName: name.split(' ')[0] }).toLowerCase(),
    phone: faker.phone.number({ style: 'international' }),
    subjects: subjectPicks,
    classes: [],
    qualification: faker.helpers.arrayElement(QUALIFICATIONS),
    experienceYears: faker.number.int({ min: 1, max: 22 }),
    joiningDate: faker.date.past({ years: 10 }).toISOString(),
    status: faker.helpers.arrayElement(STATUSES),
    salary: faker.number.int({ min: 32000, max: 95000 }),
    address: `${faker.location.streetAddress()}, ${faker.location.city()}`,
    performanceScore: faker.number.int({ min: 62, max: 99 }),
  }
})
