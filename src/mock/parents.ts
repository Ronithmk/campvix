import { faker } from '@faker-js/faker'
import type { Parent } from '@/types'
import { SCHOOL_ROSTER_CONFIG } from './school-roster-config'

faker.seed(103)

const OCCUPATIONS = [
  'Software Engineer',
  'Doctor',
  'Business Owner',
  'Accountant',
  'Government Employee',
  'Teacher',
  'Architect',
  'Lawyer',
  'Farmer',
  'Shop Owner',
]

const slots = SCHOOL_ROSTER_CONFIG.flatMap((config) => Array.from({ length: config.parentCount }, () => config.schoolId))

export const parents: Parent[] = slots.map((schoolId, i) => {
  const gender = faker.helpers.arrayElement(['male', 'female'] as const)
  const name = faker.person.fullName({ sex: gender })
  return {
    id: `parent-${i + 1}`,
    schoolId,
    name,
    avatarUrl: faker.image.avatarGitHub(),
    email: faker.internet.email({ firstName: name.split(' ')[0] }).toLowerCase(),
    phone: faker.phone.number({ style: 'international' }),
    occupation: faker.helpers.arrayElement(OCCUPATIONS),
    childrenIds: [],
    address: `${faker.location.streetAddress()}, ${faker.location.city()}`,
  }
})
