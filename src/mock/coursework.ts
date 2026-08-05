import { faker } from '@faker-js/faker'
import type { Assignment, HomeworkEntry } from '@/types'
import { classes } from './classes'
import { subjects } from './subjects'
import { teachers } from './teachers'
import { SCHOOL_ROSTER_CONFIG } from './school-roster-config'

faker.seed(202)

const ASSIGNMENT_TITLES = [
  'Algebra Problem Set', 'Essay: Climate Change', 'Lab Report - Photosynthesis', 'Chapter 5 Reading Response',
  'Geometry Worksheet', 'Historical Timeline Project', 'Programming Exercise', 'Poetry Analysis',
  'Science Fair Proposal', 'Grammar Practice Sheet', 'Map Skills Assignment', 'Book Report',
]
const ASSIGNMENT_STATUSES: Assignment['status'][] = ['published', 'published', 'grading', 'completed', 'draft']

export const assignments: Assignment[] = SCHOOL_ROSTER_CONFIG.flatMap((config) => {
  const schoolClasses = classes.filter((c) => c.schoolId === config.schoolId)
  const schoolTeachers = teachers.filter((t) => t.schoolId === config.schoolId)
  const count = Math.max(6, Math.round(schoolClasses.length * 2))

  return Array.from({ length: count }, (_, i) => {
    const klass = schoolClasses[i % schoolClasses.length]
    const subject = subjects[i % subjects.length]
    const totalStudents = klass.strength
    const status = faker.helpers.arrayElement(ASSIGNMENT_STATUSES)
    const totalSubmissions = status === 'draft' ? 0 : faker.number.int({ min: Math.floor(totalStudents * 0.4), max: totalStudents })

    return {
      id: `assignment-${config.schoolId}-${i + 1}`,
      schoolId: config.schoolId,
      title: faker.helpers.arrayElement(ASSIGNMENT_TITLES),
      subjectId: subject.id,
      classId: klass.id,
      teacherId: schoolTeachers[i % schoolTeachers.length].id,
      assignedDate: faker.date.recent({ days: 20 }).toISOString(),
      dueDate: faker.date.soon({ days: 14 }).toISOString(),
      totalSubmissions,
      totalStudents,
      graded: status === 'completed' ? totalSubmissions : status === 'grading' ? Math.floor(totalSubmissions * 0.5) : 0,
      status,
      maxScore: 100,
    } satisfies Assignment
  })
})

const HOMEWORK_TITLES = [
  'Read Chapter 3 and summarize', 'Complete worksheet pages 12-14', 'Practice multiplication tables',
  'Write 5 sentences using new vocabulary', 'Solve exercises 1-10', 'Prepare for tomorrow\'s quiz',
  'Research assignment on local history', 'Draw and label a plant cell',
]

export const homeworkEntries: HomeworkEntry[] = SCHOOL_ROSTER_CONFIG.flatMap((config) => {
  const schoolClasses = classes.filter((c) => c.schoolId === config.schoolId)
  const count = Math.max(4, Math.round(schoolClasses.length * 1.5))

  return Array.from({ length: count }, (_, i) => {
    const klass = schoolClasses[i % schoolClasses.length]
    const subject = subjects[i % subjects.length]
    return {
      id: `homework-${config.schoolId}-${i + 1}`,
      schoolId: config.schoolId,
      subjectId: subject.id,
      classId: klass.id,
      title: faker.helpers.arrayElement(HOMEWORK_TITLES),
      description: faker.lorem.sentence(),
      date: faker.date.recent({ days: 10 }).toISOString(),
      completionPercent: faker.number.int({ min: 40, max: 100 }),
    } satisfies HomeworkEntry
  })
})
