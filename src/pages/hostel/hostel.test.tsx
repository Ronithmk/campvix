import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HostelPage from './hostel'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { schools } from '@/mock/schools'
import { hostelRooms } from '@/mock/facilities'
import { formatNumber } from '@/lib/utils'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
})

const school = schools[0]
const schoolRooms = hostelRooms.filter((r) => r.schoolId === school.id)
const blocks = Array.from(new Set(schoolRooms.map((r) => r.block)))
const totalCapacity = schoolRooms.reduce((sum, r) => sum + r.capacity, 0)
const totalOccupied = schoolRooms.reduce((sum, r) => sum + r.occupied, 0)

function statValue(label: string) {
  return screen.getByText(label, { selector: 'p' }).nextElementSibling?.textContent
}

describe('HostelPage', () => {
  it('renders for administrator with stat cards matching the underlying mock data', () => {
    useAuthStore.getState().loginAsRole('administrator')
    render(<HostelPage />)

    expect(screen.getByRole('heading', { name: 'Hostel' })).toBeInTheDocument()
    expect(statValue('Total Rooms')).toBe(formatNumber(schoolRooms.length))
    expect(statValue('Blocks')).toBe(String(blocks.length))
    expect(statValue('Beds Occupied')).toBe(formatNumber(totalOccupied))
    const expectedRate = totalCapacity ? `${Math.round((totalOccupied / totalCapacity) * 100)}%` : '0%'
    expect(statValue('Occupancy Rate')).toBe(expectedRate)
  })

  it('filters rooms by block using the block select', async () => {
    expect(blocks.length).toBeGreaterThan(1)
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<HostelPage />)

    const targetBlock = blocks[0]
    const otherBlockRoom = schoolRooms.find((r) => r.block !== targetBlock)!

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: new RegExp(`^${targetBlock} block$`, 'i') }))

    expect(screen.queryByText(`Room ${otherBlockRoom.roomNo}`)).not.toBeInTheDocument()
    const expectedCount = schoolRooms.filter((r) => r.block === targetBlock).length
    expect(screen.getAllByText(/^Room /).length).toBe(expectedCount)
  })

  it('deletes a room after confirming the delete dialog, removing its card', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<HostelPage />)

    const target = schoolRooms[0]
    const card = screen.getByText(`Room ${target.roomNo}`).closest('[class*="transition-shadow"]') as HTMLElement
    expect(card).toBeTruthy()

    await user.click(within(card).getByRole('button'))
    expect(await screen.findByText(/delete this room\?/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(`Room ${target.roomNo}`)).not.toBeInTheDocument()
  })
})
