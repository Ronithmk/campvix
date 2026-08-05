import { faker } from '@faker-js/faker'
import type { Student } from '@/types'
import { classes } from './classes'
import { parents } from './parents'
import { SCHOOL_ROSTER_CONFIG } from './school-roster-config'

faker.seed(104)

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
const STATUSES: Student['status'][] = ['active', 'active', 'active', 'active', 'active', 'inactive', 'graduated']
const FEE_STATUSES: Student['feeStatus'][] = ['paid', 'paid', 'paid', 'pending', 'overdue', 'partial']
const TRANSPORT_ROUTES = ['Route A - North', 'Route B - South', 'Route C - East', 'Route D - West', null, null]

let globalIndex = 0

export const students: Student[] = SCHOOL_ROSTER_CONFIG.flatMap((config) => {
  const schoolClasses = classes.filter((c) => c.schoolId === config.schoolId)
  const schoolParents = parents.filter((p) => p.schoolId === config.schoolId)

  return Array.from({ length: config.studentCount }, () => {
    const i = globalIndex
    globalIndex += 1

    const gender = faker.helpers.arrayElement(['male', 'female'] as const)
    const name = faker.person.fullName({ sex: gender })
    const klass = schoolClasses[i % schoolClasses.length]
    const parent = schoolParents[i % schoolParents.length]
    const id = `student-${i + 1}`
    parent.childrenIds.push(id)
    const attendancePercent = faker.number.int({ min: 68, max: 100 })
    const feeStatus = faker.helpers.arrayElement(FEE_STATUSES)

    return {
      id,
      schoolId: config.schoolId,
      admissionNo: `ADM-${String(2100 + i)}`,
      name,
      avatarUrl: faker.image.avatarGitHub(),
      gender,
      dateOfBirth: faker.date.birthdate({ min: 5, max: 18, mode: 'age' }).toISOString(),
      classId: klass.id,
      className: klass.name.split(' - ')[0],
      section: klass.sections[0],
      rollNo: (i % klass.strength) + 1,
      status: faker.helpers.arrayElement(STATUSES),
      email: faker.internet.email({ firstName: name.split(' ')[0] }).toLowerCase(),
      phone: faker.phone.number({ style: 'international' }),
      address: `${faker.location.streetAddress()}, ${faker.location.city()}`,
      bloodGroup: faker.helpers.arrayElement(BLOOD_GROUPS),
      parentId: parent.id,
      parentName: parent.name,
      transportRoute: faker.helpers.arrayElement(TRANSPORT_ROUTES),
      hostelRoom: faker.datatype.boolean({ probability: 0.15 })
        ? `H-${faker.number.int({ min: 1, max: 4 })}0${faker.number.int({ min: 1, max: 9 })}`
        : null,
      admissionDate: faker.date.past({ years: 6 }).toISOString(),
      feeStatus,
      attendancePercent,
      gpa: Number(faker.number.float({ min: 5.5, max: 10, fractionDigits: 1 })),
    } satisfies Student
  })
})
