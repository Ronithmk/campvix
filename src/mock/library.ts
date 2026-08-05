import { faker } from '@faker-js/faker'
import type { BookIssue, LibraryBook } from '@/types'
import { students } from './students'
import { SCHOOL_ROSTER_CONFIG } from './school-roster-config'

faker.seed(203)

const BOOK_TITLES: Array<[string, string, LibraryBook['category']]> = [
  ['The Wind in the Willows', 'Kenneth Grahame', 'fiction'],
  ['A Brief History of Time', 'Stephen Hawking', 'science'],
  ['To Kill a Mockingbird', 'Harper Lee', 'fiction'],
  ['The Diary of a Young Girl', 'Anne Frank', 'biography'],
  ['Encyclopedia of Animals', 'DK Publishing', 'reference'],
  ['Charlotte\'s Web', 'E.B. White', 'children'],
  ['Sapiens', 'Yuval Noah Harari', 'non_fiction'],
  ['The Elements of Style', 'Strunk & White', 'reference'],
  ['Matilda', 'Roald Dahl', 'children'],
  ['Cosmos', 'Carl Sagan', 'science'],
  ['The Alchemist', 'Paulo Coelho', 'fiction'],
  ['Steve Jobs', 'Walter Isaacson', 'biography'],
  ['Introduction to Algorithms', 'Cormen et al.', 'reference'],
  ['Harry Potter and the Sorcerer\'s Stone', 'J.K. Rowling', 'children'],
  ['The Selfish Gene', 'Richard Dawkins', 'science'],
  ['Educated', 'Tara Westover', 'biography'],
]

const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#db2777']

export const libraryBooks: LibraryBook[] = SCHOOL_ROSTER_CONFIG.flatMap((config) =>
  BOOK_TITLES.map(([title, author, category], i) => {
    const totalCopies = faker.number.int({ min: 2, max: Math.max(3, Math.round(config.studentCount / 30)) })
    return {
      id: `book-${config.schoolId}-${i + 1}`,
      schoolId: config.schoolId,
      title,
      author,
      isbn: faker.commerce.isbn({ separator: '-' }),
      category,
      coverColor: COLORS[i % COLORS.length],
      totalCopies,
      availableCopies: faker.number.int({ min: 0, max: totalCopies }),
      shelfLocation: `${faker.helpers.arrayElement(['A', 'B', 'C', 'D'])}-${faker.number.int({ min: 1, max: 24 })}`,
    } satisfies LibraryBook
  }),
)

const STATUSES: BookIssue['status'][] = ['issued', 'issued', 'returned', 'returned', 'overdue']

export const bookIssues: BookIssue[] = SCHOOL_ROSTER_CONFIG.flatMap((config) => {
  const schoolBooks = libraryBooks.filter((b) => b.schoolId === config.schoolId)
  const schoolStudents = students.filter((s) => s.schoolId === config.schoolId)
  const count = Math.max(4, Math.round(config.studentCount / 15))

  return Array.from({ length: count }, (_, i) => {
    const book = schoolBooks[i % schoolBooks.length]
    const student = schoolStudents[(i * 7) % schoolStudents.length]
    const status = faker.helpers.arrayElement(STATUSES)
    const issueDate = faker.date.recent({ days: 30 })
    const dueDate = new Date(issueDate)
    dueDate.setDate(dueDate.getDate() + 14)

    return {
      id: `issue-${config.schoolId}-${i + 1}`,
      schoolId: config.schoolId,
      bookId: book.id,
      bookTitle: book.title,
      studentName: student.name,
      studentAvatar: student.avatarUrl,
      issueDate: issueDate.toISOString(),
      dueDate: dueDate.toISOString(),
      returnDate: status === 'returned' ? faker.date.recent({ days: 10 }).toISOString() : null,
      status,
      fine: status === 'overdue' ? faker.number.int({ min: 10, max: 150 }) : 0,
    } satisfies BookIssue
  })
})
