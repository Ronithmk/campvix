import { faker } from '@faker-js/faker'
import type { Staff, StaffRole } from '@/types'
import { SCHOOL_ROSTER_CONFIG } from './school-roster-config'

faker.seed(105)

const ROLE_COUNTS: Array<[StaffRole, number]> = [
  ['accountant', 4],
  ['receptionist', 3],
  ['driver', 8],
  ['librarian', 2],
  ['admin_staff', 6],
]

export const staff: Staff[] = SCHOOL_ROSTER_CONFIG.flatMap((config) =>
  ROLE_COUNTS.flatMap(([role, baseCount]) => {
    const count = Math.max(1, Math.round(baseCount * config.staffScale))
    return Array.from({ length: count }, (_, i) => {
      const gender = faker.helpers.arrayElement(['male', 'female'] as const)
      const name = faker.person.fullName({ sex: gender })
      return {
        id: `staff-${config.schoolId}-${role}-${i + 1}`,
        schoolId: config.schoolId,
        name,
        avatarUrl: faker.image.avatarGitHub(),
        role,
        email: faker.internet.email({ firstName: name.split(' ')[0] }).toLowerCase(),
        phone: faker.phone.number({ style: 'international' }),
        joiningDate: faker.date.past({ years: 8 }).toISOString(),
        status: faker.helpers.arrayElement(['active', 'active', 'active', 'inactive'] as const),
      } satisfies Staff
    })
  }),
)
