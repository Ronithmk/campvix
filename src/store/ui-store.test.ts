import { beforeEach, describe, expect, it } from 'vitest'
import { useUiStore } from './ui-store'

beforeEach(() => {
  useUiStore.setState({ sidebarCollapsed: false, commandPaletteOpen: false })
})

describe('useUiStore', () => {
  it('has the expected initial state', () => {
    expect(useUiStore.getState().sidebarCollapsed).toBe(false)
    expect(useUiStore.getState().commandPaletteOpen).toBe(false)
  })

  describe('toggleSidebar', () => {
    it('flips sidebarCollapsed from false to true', () => {
      useUiStore.getState().toggleSidebar()
      expect(useUiStore.getState().sidebarCollapsed).toBe(true)
    })

    it('flips sidebarCollapsed back to false on a second call', () => {
      useUiStore.getState().toggleSidebar()
      useUiStore.getState().toggleSidebar()
      expect(useUiStore.getState().sidebarCollapsed).toBe(false)
    })
  })

  describe('setCommandPaletteOpen', () => {
    it('sets commandPaletteOpen to true', () => {
      useUiStore.getState().setCommandPaletteOpen(true)
      expect(useUiStore.getState().commandPaletteOpen).toBe(true)
    })

    it('sets commandPaletteOpen to false', () => {
      useUiStore.setState({ commandPaletteOpen: true })
      useUiStore.getState().setCommandPaletteOpen(false)
      expect(useUiStore.getState().commandPaletteOpen).toBe(false)
    })
  })
})
