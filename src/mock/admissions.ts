import { faker } from '@faker-js/faker'
import type { Admission, AdmissionStage } from '@/types'
import { SCHOOL_ROSTER_CONFIG } from './school-roster-config'

faker.seed(201)

const STAGES: AdmissionStage[] = ['inquiry', 'application', 'entrance_test', 'interview', 'offer', 'enrolled', 'rejected']
const GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
const SOURCES: Admission['source'][] = ['website', 'referral', 'walk_in', 'agent']

const slots = SCHOOL_ROSTER_CONFIG.flatMap((config) => {
  const count = Math.max(8, Math.round(config.studentCount * 0.12))
  return Array.from({ length: count }, () => config.schoolId)
})

export const admissions: Admission[] = slots.map((schoolId, i) => {
  const gender = faker.helpers.arrayElement(['male', 'female'] as const)
  const name = faker.person.fullName({ sex: gender })
  const parentGender = faker.helpers.arrayElement(['male', 'female'] as const)
  const parentName = faker.person.fullName({ sex: parentGender })
  const stage = faker.helpers.arrayElement(STAGES)

  return {
    id: `admission-${i + 1}`,
    schoolId,
    applicantName: name,
    avatarUrl: faker.image.avatarGitHub(),
    gradeAppliedFor: faker.helpers.arrayElement(GRADES),
    parentName,
    parentEmail: faker.internet.email({ firstName: parentName.split(' ')[0] }).toLowerCase(),
    parentPhone: faker.phone.number({ style: 'international' }),
    stage,
    appliedDate: faker.date.recent({ days: 45 }).toISOString(),
    score: stage === 'inquiry' || stage === 'application' ? null : faker.number.int({ min: 55, max: 99 }),
    source: faker.helpers.arrayElement(SOURCES),
  }
})
