import { faker } from '@faker-js/faker'
import type { Announcement, ChatMessage, ChatThread, NoticeBoardPost } from '@/types'
import { teachers } from './teachers'
import { parents } from './parents'
import { SCHOOL_ROSTER_CONFIG } from './school-roster-config'

faker.seed(206)

const ANNOUNCEMENT_DEFS: Array<[string, string, Announcement['audience'], boolean]> = [
  ['School reopens after winter break', 'Classes resume on January 6th at the regular schedule. Please ensure students carry updated textbooks.', 'all', true],
  ['Annual Sports Day registrations open', 'Students interested in participating should register with their class teacher by Friday.', 'students', false],
  ['Parent-Teacher meeting scheduled', 'PTMs for all grades will be held next Saturday from 9 AM to 1 PM in respective classrooms.', 'parents', true],
  ['Staff development workshop', 'A mandatory workshop on the new grading rubric will be held in the auditorium.', 'teachers', false],
  ['Fee payment deadline reminder', 'Term 2 fees are due by the 15th. Late payments will incur a fine as per policy.', 'parents', true],
  ['New library books arrived', 'Over 200 new titles have been added to the library catalog across all categories.', 'all', false],
  ['Transport route changes', 'Route C has been updated to include a new stop at Green Park. Please check the updated schedule.', 'parents', false],
  ['Exam hall ticket distribution', 'Hall tickets for the mid-term examinations will be distributed this Thursday.', 'students', false],
]

export const announcements: Announcement[] = SCHOOL_ROSTER_CONFIG.flatMap((config) => {
  const schoolTeachers = teachers.filter((t) => t.schoolId === config.schoolId)
  return ANNOUNCEMENT_DEFS.map(([title, body, audience, pinned], i) => {
    const author = schoolTeachers[i % schoolTeachers.length]
    return {
      id: `announcement-${config.schoolId}-${i + 1}`,
      schoolId: config.schoolId,
      title,
      body,
      audience,
      author: author.name,
      authorAvatar: author.avatarUrl,
      publishedDate: faker.date.recent({ days: 20 }).toISOString(),
      pinned,
    } satisfies Announcement
  })
})

const NOTICE_DEFS: Array<[string, NoticeBoardPost['category']]> = [
  ['Mid-term exam schedule published', 'academic'],
  ['Independence Day celebration rehearsal', 'event'],
  ['Submission deadline for scholarship forms', 'administrative'],
  ['School closed tomorrow due to weather', 'urgent'],
  ['New uniform vendor list available', 'administrative'],
  ['Inter-house quiz competition', 'event'],
  ['Library fine waiver week', 'academic'],
  ['Fire drill scheduled this Friday', 'urgent'],
]

export const noticeBoardPosts: NoticeBoardPost[] = SCHOOL_ROSTER_CONFIG.flatMap((config) => {
  const schoolTeachers = teachers.filter((t) => t.schoolId === config.schoolId)
  return NOTICE_DEFS.map(([title, category], i) => {
    const posted = faker.date.recent({ days: 15 })
    const expiry = new Date(posted)
    expiry.setDate(expiry.getDate() + faker.number.int({ min: 5, max: 20 }))
    return {
      id: `notice-${config.schoolId}-${i + 1}`,
      schoolId: config.schoolId,
      title,
      category,
      body: faker.lorem.sentences(2),
      postedBy: faker.helpers.arrayElement(schoolTeachers).name,
      postedDate: posted.toISOString(),
      expiryDate: expiry.toISOString(),
    } satisfies NoticeBoardPost
  })
})

const SAMPLE_MESSAGES = [
  'Good morning! Just wanted to check in on how the assignment is going.',
  'Thank you for the update, I appreciate it.',
  'Could we schedule a quick call this week?',
  'Absolutely, that works for me.',
  'I noticed the attendance was a bit low this week, is everything okay?',
  'Yes, we had a family situation, but things are back on track now.',
  'Great to hear! Let me know if you need anything.',
  'Will do, thanks again for reaching out.',
]

function buildThread(id: string, name: string, avatar: string, role: 'parent' | 'teacher', index: number): ChatThread {
  const messageCount = faker.number.int({ min: 3, max: 8 })
  const messages: ChatMessage[] = Array.from({ length: messageCount }, (_, mi) => ({
    id: `${id}-msg-${mi}`,
    senderId: mi % 2 === 0 ? id : 'self',
    senderName: mi % 2 === 0 ? name : 'You',
    text: SAMPLE_MESSAGES[(index + mi) % SAMPLE_MESSAGES.length],
    timestamp: faker.date.recent({ days: 5 }).toISOString(),
    isSelf: mi % 2 !== 0,
  }))

  return {
    id,
    participantName: name,
    participantAvatar: avatar,
    participantRole: role,
    lastMessage: messages[messages.length - 1].text,
    lastMessageTime: messages[messages.length - 1].timestamp,
    unread: faker.number.int({ min: 0, max: 3 }),
    messages,
  }
}

export const chatThreads: ChatThread[] = [
  ...parents.slice(0, 10).map((p, i) => buildThread(`thread-parent-${p.id}`, p.name, p.avatarUrl, 'parent', i)),
  ...teachers.slice(0, 6).map((t, i) => buildThread(`thread-teacher-${t.id}`, t.name, t.avatarUrl, 'teacher', i + 10)),
].sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
