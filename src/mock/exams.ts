import { faker } from '@faker-js/faker'
import type { Exam, Result } from '@/types'
import { classes } from './classes'
import { subjects } from './subjects'
import { students } from './students'
import { SCHOOL_ROSTER_CONFIG } from './school-roster-config'

faker.seed(108)

const EXAM_NAMES = ['Unit Test 1', 'Mid Term', 'Unit Test 2', 'Final Examination', 'Class Test']

const examClasses = SCHOOL_ROSTER_CONFIG.flatMap((config) => classes.filter((c) => c.schoolId === config.schoolId).slice(0, 8))

export const exams: Exam[] = examClasses.flatMap((klass, ci) =>
  subjects.slice(0, 3).map((subject, si) => {
    const index = ci * 3 + si
    return {
      id: `exam-${index + 1}`,
      schoolId: klass.schoolId,
      name: faker.helpers.arrayElement(EXAM_NAMES),
      subjectId: subject.id,
      classId: klass.id,
      date: faker.date.soon({ days: 60 }).toISOString(),
      maxMarks: 100,
      status: faker.helpers.arrayElement(['upcoming', 'ongoing', 'completed', 'graded'] as const),
    } satisfies Exam
  }),
)

export const results: Result[] = exams
  .filter((e) => e.status === 'graded' || e.status === 'completed')
  .flatMap((exam) => {
    const classStudents = students.filter((s) => s.classId === exam.classId).slice(0, 15)
    return classStudents.map((student, si) => {
      const marksObtained = faker.number.int({ min: 35, max: 100 })
      return {
        id: `result-${exam.id}-${si}`,
        schoolId: exam.schoolId,
        examId: exam.id,
        studentId: student.id,
        marksObtained,
        maxMarks: exam.maxMarks,
        grade: marksObtained >= 90 ? 'A+' : marksObtained >= 80 ? 'A' : marksObtained >= 70 ? 'B+' : marksObtained >= 60 ? 'B' : marksObtained >= 50 ? 'C+' : marksObtained >= 40 ? 'C' : 'D',
      } satisfies Result
    })
  })
