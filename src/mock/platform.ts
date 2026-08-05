import { faker } from '@faker-js/faker'
import type { AlumniProfile, Course, DocumentItem, EmailTemplate, GalleryAlbum } from '@/types'
import { subjects } from './subjects'
import { teachers } from './teachers'
import { SCHOOL_ROSTER_CONFIG } from './school-roster-config'

faker.seed(207)

const COMPANIES = ['Google', 'Microsoft', 'Infosys', 'TCS', 'Amazon', 'Flipkart', 'Goldman Sachs', 'Deloitte', 'ISRO', 'Self-employed']
const ROLES = ['Software Engineer', 'Product Manager', 'Data Scientist', 'Doctor', 'Entrepreneur', 'Research Scientist', 'Consultant', 'Civil Servant', 'Architect', 'Lawyer']

export const alumni: AlumniProfile[] = SCHOOL_ROSTER_CONFIG.flatMap((config) => {
  const count = Math.max(6, Math.round(config.studentCount / 15))
  return Array.from({ length: count }, (_, i) => {
    const gender = faker.helpers.arrayElement(['male', 'female'] as const)
    const name = faker.person.fullName({ sex: gender })
    return {
      id: `alumni-${config.schoolId}-${i + 1}`,
      schoolId: config.schoolId,
      name,
      avatarUrl: faker.image.avatarGitHub(),
      graduationYear: faker.number.int({ min: 2005, max: 2025 }),
      currentRole: faker.helpers.arrayElement(ROLES),
      company: faker.helpers.arrayElement(COMPANIES),
      location: `${faker.location.city()}, ${faker.helpers.arrayElement(['India', 'USA', 'UK', 'Canada', 'Singapore'])}`,
      email: faker.internet.email({ firstName: name.split(' ')[0] }).toLowerCase(),
      linkedIn: `linkedin.com/in/${faker.internet.username({ firstName: name.split(' ')[0] }).toLowerCase()}`,
      donated: faker.datatype.boolean({ probability: 0.3 }),
    } satisfies AlumniProfile
  })
})

export const COURSE_TITLES = [
  'Algebra Foundations', 'Introduction to Physics', 'Creative Writing Workshop', 'World History: Ancient Civilizations',
  'Python Programming Basics', 'Environmental Science', 'Public Speaking Mastery', 'Advanced Calculus',
  'Digital Art & Design', 'Financial Literacy for Teens', 'Robotics Fundamentals', 'Spanish for Beginners',
]
const COURSE_STATUSES: Course['status'][] = ['published', 'published', 'published', 'draft', 'archived']
export const THUMB_COLORS = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2']

export const courses: Course[] = SCHOOL_ROSTER_CONFIG.flatMap((config) => {
  const schoolTeachers = teachers.filter((t) => t.schoolId === config.schoolId)
  const count = Math.max(3, Math.round(config.studentCount / 60))
  return Array.from({ length: count }, (_, i) => ({
    id: `course-${config.schoolId}-${i + 1}`,
    schoolId: config.schoolId,
    title: COURSE_TITLES[i % COURSE_TITLES.length],
    subjectId: subjects[i % subjects.length].id,
    instructor: schoolTeachers[i % schoolTeachers.length]?.name ?? teachers[i % teachers.length].name,
    thumbnail: THUMB_COLORS[i % THUMB_COLORS.length],
    lessonsCount: faker.number.int({ min: 8, max: 32 }),
    enrolledCount: faker.number.int({ min: 15, max: 210 }),
    progress: faker.number.int({ min: 0, max: 100 }),
    status: faker.helpers.arrayElement(COURSE_STATUSES),
    duration: `${faker.number.int({ min: 4, max: 16 })} weeks`,
  }))
})

const DOC_DEFS: Array<[string, DocumentItem['type'], string]> = [
  ['Admission Policy 2026-27.pdf', 'pdf', 'Policies'],
  ['Fee Structure.sheet', 'sheet', 'Finance'],
  ['Staff Handbook.doc', 'doc', 'HR'],
  ['Annual Report 2025.pdf', 'pdf', 'Reports'],
  ['Campus Map.image', 'image', 'General'],
  ['Exam Guidelines.pdf', 'pdf', 'Academics'],
  ['Curriculum Framework', 'folder', 'Academics'],
  ['Transport Routes.sheet', 'sheet', 'Operations'],
  ['Board Meeting Minutes.doc', 'doc', 'Administration'],
  ['Student Handbook.pdf', 'pdf', 'Policies'],
  ['Teacher Resources', 'folder', 'Academics'],
  ['Emergency Contacts.sheet', 'sheet', 'General'],
]

export const documents: DocumentItem[] = SCHOOL_ROSTER_CONFIG.flatMap((config) => {
  const schoolTeachers = teachers.filter((t) => t.schoolId === config.schoolId)
  return DOC_DEFS.map(([name, type, folder], i) => ({
    id: `doc-${config.schoolId}-${i + 1}`,
    schoolId: config.schoolId,
    name,
    type,
    size: type === 'folder' ? '—' : `${faker.number.int({ min: 80, max: 4200 })} KB`,
    owner: (schoolTeachers[i % schoolTeachers.length] ?? faker.helpers.arrayElement(teachers)).name,
    modifiedDate: faker.date.recent({ days: 40 }).toISOString(),
    folder,
    starred: faker.datatype.boolean({ probability: 0.2 }),
  }))
})

const TEMPLATE_DEFS: Array<[string, string, EmailTemplate['category']]> = [
  ['Fee Payment Reminder', 'Your fee payment is due soon', 'fee_reminder'],
  ['Admission Confirmation', 'Welcome to CampusFlow!', 'admission'],
  ['Low Attendance Alert', 'Attendance notice for your ward', 'attendance'],
  ['Exam Schedule Notification', 'Upcoming examination schedule', 'exam'],
  ['Welcome New Parent', 'Getting started with CampusFlow', 'general'],
  ['Overdue Fee Notice', 'Urgent: Fee payment overdue', 'fee_reminder'],
  ['Report Card Ready', 'Your child\'s report card is available', 'exam'],
  ['Event Invitation', 'You\'re invited to our school event', 'general'],
]

export const emailTemplates: EmailTemplate[] = SCHOOL_ROSTER_CONFIG.flatMap((config) =>
  TEMPLATE_DEFS.map(([name, subject, category], i) => ({
    id: `template-${config.schoolId}-${i + 1}`,
    schoolId: config.schoolId,
    name,
    subject,
    category,
    lastEdited: faker.date.recent({ days: 30 }).toISOString(),
    sentCount: faker.number.int({ min: 12, max: 2400 }),
    preview: faker.lorem.paragraph(),
  })),
)

export const ALBUM_DEFS: Array<[string, string]> = [
  ['Annual Sports Day 2026', '#2563eb'],
  ['Science Exhibition', '#059669'],
  ['Graduation Ceremony', '#d97706'],
  ['Independence Day Celebration', '#dc2626'],
  ['Art & Craft Fair', '#7c3aed'],
  ['Winter Carnival', '#0891b2'],
  ['Inter-School Debate', '#db2777'],
  ['Cultural Fest', '#16a34a'],
]

export const COVER_COLORS = ALBUM_DEFS.map(([, color]) => color)

export const galleryAlbums: GalleryAlbum[] = SCHOOL_ROSTER_CONFIG.flatMap((config) => {
  const count = Math.max(3, Math.round(config.studentCount / 65))
  return Array.from({ length: count }, (_, i) => {
    const [title, color] = ALBUM_DEFS[i % ALBUM_DEFS.length]
    return {
      id: `album-${config.schoolId}-${i + 1}`,
      schoolId: config.schoolId,
      title,
      coverColor: color,
      eventDate: faker.date.recent({ days: 200 }).toISOString(),
      photoCount: faker.number.int({ min: 12, max: 180 }),
      isPublic: faker.datatype.boolean({ probability: 0.7 }),
    } satisfies GalleryAlbum
  })
})
