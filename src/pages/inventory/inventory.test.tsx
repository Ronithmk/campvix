import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InventoryPage from './inventory'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { schools } from '@/mock/schools'
import { inventoryItems } from '@/mock/facilities'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
})

const school = schools[0]
const schoolInventory = inventoryItems.filter((i) => i.schoolId === school.id)
const lowStock = schoolInventory.filter((i) => i.quantity <= i.minThreshold).length
const totalUnits = schoolInventory.reduce((sum, i) => sum + i.quantity, 0)

function statValue(label: string) {
  return screen.getByText(label, { selector: 'p' }).nextElementSibling?.textContent
}

describe('InventoryPage', () => {
  it('renders for administrator with stat cards matching the underlying mock data', () => {
    useAuthStore.getState().loginAsRole('administrator')
    render(<InventoryPage />)

    expect(screen.getByRole('heading', { name: 'Inventory' })).toBeInTheDocument()
    expect(statValue('Total Items')).toBe(String(schoolInventory.length))
    expect(statValue('Total Units')).toBe(String(totalUnits))
    expect(statValue('Low Stock Alerts')).toBe(String(lowStock))
  })

  it('filters rows by category using the category select', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<InventoryPage />)

    await user.click(screen.getAllByRole('combobox')[0])
    await user.click(await screen.findByRole('option', { name: /^electronics$/i }))

    const expectedNames = schoolInventory.filter((i) => i.category === 'electronics').map((i) => i.name)
    const otherNames = schoolInventory.filter((i) => i.category !== 'electronics').map((i) => i.name)

    for (const name of expectedNames) expect(screen.getByText(name)).toBeInTheDocument()
    for (const name of otherNames) expect(screen.queryByText(name)).not.toBeInTheDocument()
  })

  it('actually filters rows via the search box', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<InventoryPage />)

    const target = schoolInventory[0]
    const other = schoolInventory.find((i) => i.name !== target.name)!

    await user.type(screen.getByPlaceholderText(/search inventory/i), target.name)

    expect(screen.getByText(target.name)).toBeInTheDocument()
    expect(screen.queryByText(other.name)).not.toBeInTheDocument()
  })

  it('adds a new item scoped to the current school', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<InventoryPage />)

    await user.click(screen.getByRole('button', { name: /add item/i }))
    const dialog = screen.getByRole('dialog')

    await user.type(screen.getByLabelText(/item name/i), 'Automated Test Kits')
    await user.click(within(dialog).getByRole('combobox', { name: /category/i }))
    await user.click(await screen.findByRole('option', { name: /^electronics$/i }))
    const quantityInput = screen.getByLabelText(/quantity/i)
    await user.clear(quantityInput)
    await user.type(quantityInput, '20')
    const unitInput = screen.getByLabelText(/^unit$/i)
    await user.clear(unitInput)
    await user.type(unitInput, 'kits')
    await user.click(within(dialog).getByRole('button', { name: /^add item$/i }))

    expect(await screen.findByText('Automated Test Kits')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('removes an item through the row action + confirm dialog', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<InventoryPage />)

    const target = schoolInventory[0]
    const row = screen.getByText(target.name).closest('tr') as HTMLElement
    expect(row).toBeTruthy()

    await user.click(within(row).getByRole('button'))
    await user.click(await screen.findByRole('menuitem', { name: /remove item/i }))

    expect(await screen.findByText(/remove this item\?/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(target.name)).not.toBeInTheDocument()
  })
})
