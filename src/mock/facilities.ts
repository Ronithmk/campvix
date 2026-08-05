import { faker } from '@faker-js/faker'
import type { HostelRoom, InventoryItem, TransportRoute } from '@/types'
import { students } from './students'
import { SCHOOL_ROSTER_CONFIG } from './school-roster-config'

faker.seed(204)

const ROUTE_NAMES = ['Route A - North', 'Route B - South', 'Route C - East', 'Route D - West', 'Route E - Central', 'Route F - Riverside']
const STOP_SETS = [
  ['Elm Street', 'Oak Avenue', 'Maple Court', 'School Gate'],
  ['Pine Road', 'Cedar Lane', 'Birch Street', 'School Gate'],
  ['Sunrise Colony', 'Lake View', 'Green Park', 'School Gate'],
  ['Hilltop Society', 'Market Square', 'Central Plaza', 'School Gate'],
]

export const transportRoutes: TransportRoute[] = SCHOOL_ROSTER_CONFIG.flatMap((config) => {
  const routeCount = Math.max(1, Math.round(config.studentCount / 200))
  return Array.from({ length: routeCount }, (_, i) => {
    const gender = faker.helpers.arrayElement(['male', 'female'] as const)
    const driverName = faker.person.fullName({ sex: gender })
    const capacity = faker.number.int({ min: 35, max: 55 })
    const stops = STOP_SETS[i % STOP_SETS.length]

    return {
      id: `route-${config.schoolId}-${i + 1}`,
      schoolId: config.schoolId,
      name: ROUTE_NAMES[i % ROUTE_NAMES.length],
      vehicleNo: `KA-${faker.number.int({ min: 1, max: 60 })}-${faker.string.alpha({ length: 2, casing: 'upper' })}-${faker.number.int({ min: 1000, max: 9999 })}`,
      driverName,
      driverAvatar: faker.image.avatarGitHub(),
      driverPhone: faker.phone.number({ style: 'international' }),
      capacity,
      occupied: faker.number.int({ min: Math.floor(capacity * 0.6), max: capacity }),
      stops,
      status: faker.helpers.arrayElement(['on_route', 'on_route', 'idle', 'maintenance'] as const),
      currentStop: faker.helpers.arrayElement(stops),
      etaMinutes: faker.number.int({ min: 2, max: 25 }),
    } satisfies TransportRoute
  })
})

const BLOCKS = ['Ashoka', 'Nehru', 'Gandhi', 'Tagore']
const ROOM_TYPES: HostelRoom['type'][] = ['single', 'double', 'dormitory']

export const hostelRooms: HostelRoom[] = SCHOOL_ROSTER_CONFIG.flatMap((config) => {
  const schoolStudents = students.filter((s) => s.schoolId === config.schoolId)
  const roomCount = Math.max(4, Math.round(config.studentCount / 28))

  return Array.from({ length: roomCount }, (_, i) => {
    const block = BLOCKS[i % BLOCKS.length]
    const type = ROOM_TYPES[i % ROOM_TYPES.length]
    const capacity = type === 'single' ? 1 : type === 'double' ? 2 : 6
    const occupied = faker.number.int({ min: 0, max: capacity })
    const wardenGender = faker.helpers.arrayElement(['male', 'female'] as const)

    return {
      id: `room-${config.schoolId}-${i + 1}`,
      schoolId: config.schoolId,
      roomNo: `${block[0]}${100 + i}`,
      block,
      floor: faker.number.int({ min: 1, max: 4 }),
      capacity,
      occupied,
      wardenName: faker.person.fullName({ sex: wardenGender }),
      type,
      occupants: Array.from({ length: occupied }, () => schoolStudents[faker.number.int({ min: 0, max: Math.max(0, schoolStudents.length - 1) })]?.name ?? 'Unassigned'),
    } satisfies HostelRoom
  })
})

const INVENTORY_DEFS: Array<[string, InventoryItem['category'], string]> = [
  ['Student Desks', 'furniture', 'units'],
  ['Office Chairs', 'furniture', 'units'],
  ['Projectors', 'electronics', 'units'],
  ['Laptops', 'electronics', 'units'],
  ['Microscopes', 'lab_equipment', 'units'],
  ['Basketballs', 'sports', 'units'],
  ['Football Kits', 'sports', 'sets'],
  ['A4 Paper Reams', 'stationery', 'reams'],
  ['Whiteboard Markers', 'stationery', 'boxes'],
  ['Library Books', 'books', 'copies'],
  ['Chemistry Lab Kits', 'lab_equipment', 'sets'],
  ['Interactive Whiteboards', 'electronics', 'units'],
]

export const inventoryItems: InventoryItem[] = SCHOOL_ROSTER_CONFIG.flatMap((config) =>
  INVENTORY_DEFS.map(([name, category, unit], i) => {
    const quantity = faker.number.int({ min: 5, max: Math.max(10, Math.round(config.studentCount * 0.8)) })
    return {
      id: `inv-${config.schoolId}-${i + 1}`,
      schoolId: config.schoolId,
      name,
      category,
      quantity,
      minThreshold: Math.floor(quantity * 0.2) || 5,
      unit,
      location: faker.helpers.arrayElement(['Main Store', 'Block A Store', 'Lab Store', 'Sports Room', 'Library']),
      lastRestocked: faker.date.recent({ days: 60 }).toISOString(),
      vendor: faker.company.name(),
    } satisfies InventoryItem
  }),
)
