import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// vitest.config.ts intentionally runs with globals: false (explicit imports
// per test file), so @testing-library/react's auto-cleanup — which detects a
// global `afterEach` — never registers. Without this, every render() in a
// file accumulates DOM across tests instead of unmounting between them.
afterEach(() => {
  cleanup()
})

// Radix UI primitives (Select, Dialog, Popover, ...) call pointer-capture and
// layout APIs jsdom doesn't implement. Without these, interacting with them
// under jsdom throws or silently no-ops instead of opening/closing.
if (!window.HTMLElement.prototype.hasPointerCapture) {
  window.HTMLElement.prototype.hasPointerCapture = () => false
}
if (!window.HTMLElement.prototype.setPointerCapture) {
  window.HTMLElement.prototype.setPointerCapture = () => {}
}
if (!window.HTMLElement.prototype.releasePointerCapture) {
  window.HTMLElement.prototype.releasePointerCapture = () => {}
}
if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {}
}
if (!window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
