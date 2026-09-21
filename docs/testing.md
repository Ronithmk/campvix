# Testing — Reference & How-To

Vitest + React Testing Library + jsdom, 84+ test files colocated next to the source they cover (`students-list.test.tsx` sits beside `students-list.tsx`).

## Running tests

```bash
npm run test         # single pass, CI mode (vitest run)
npm run test:watch   # watch mode
npx vitest run path/to/file.test.tsx   # a single file
```

## Configuration — `vitest.config.ts` (full)

```ts
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    testTimeout: 10000,
    maxWorkers: 4,
  },
})
```

Two settings are worth understanding before you add tests of your own:

- **`testTimeout: 10000` + `maxWorkers: 4`, not the 5s default.** Many components' `onSubmit` handlers `await sleep(500)` to simulate network latency (see [adding-a-module.md](./adding-a-module.md)). Across ~85 test files running concurrently, that's enough real CPU contention to blow past a 5s timeout intermittently — even though any single test is fast in isolation. The fix is capping worker concurrency (fewer simultaneous sleeps), not just raising the timeout further; don't "fix" a flaky timeout by cranking `testTimeout` even higher — check whether you're adding another concurrent `sleep()` first.
- **`globals: false`** (the default — not set explicitly, but relied upon). Every test file explicitly imports `describe`/`it`/`expect`/`beforeEach` from `vitest` rather than relying on injected globals.

## `src/test/setup.ts` (full)

```ts
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

afterEach(() => {
  cleanup()
})

if (!window.HTMLElement.prototype.hasPointerCapture) window.HTMLElement.prototype.hasPointerCapture = () => false
if (!window.HTMLElement.prototype.setPointerCapture) window.HTMLElement.prototype.setPointerCapture = () => {}
if (!window.HTMLElement.prototype.releasePointerCapture) window.HTMLElement.prototype.releasePointerCapture = () => {}
if (!window.HTMLElement.prototype.scrollIntoView) window.HTMLElement.prototype.scrollIntoView = () => {}
if (!window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver { observe() {} unobserve() {} disconnect() {} }
}
```

Two things this file exists to fix, both load-bearing:

1. **Manual `afterEach(cleanup)`.** Because `globals: false` means Testing Library's implicit auto-cleanup (which hooks a *global* `afterEach`) never registers, every `render()` would otherwise accumulate DOM across tests in the same file instead of unmounting between them. If you see a test failing because it's matching **two** copies of the same element, check whether the file's `render()` calls are missing this cleanup — though it should already be global via `setupFiles`.
2. **jsdom polyfills for Radix.** Radix primitives (`Select`, `Dialog`, `Popover`, ...) call pointer-capture and layout APIs jsdom doesn't implement. Without these stubs, interacting with a `Select` or `Dialog` under jsdom throws or silently no-ops instead of opening/closing — a test that clicks a `SelectTrigger` and then can't find the options is usually missing one of these, not a real bug in the component.

## Conventions, from `school-switcher.test.tsx`

```tsx
import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { SchoolSwitcher } from './school-switcher'
import { useAuthStore } from '@/store/auth-store'
import { schools } from '@/mock/schools'

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().logout()
  useAuthStore.setState({ schoolId: schools[0].id })
})

function renderSwitcher(props?: { collapsed?: boolean }) {
  return render(
    <MemoryRouter>
      <SchoolSwitcher {...props} />
    </MemoryRouter>,
  )
}
```

- **Reset shared state in `beforeEach`, not per-test.** Zustand stores (`useAuthStore`, `usePermissionsStore`, `useUiStore`) persist across tests within a file since they're module-level singletons. Always `localStorage.clear()` plus reset every store your component reads, directly via `.getState()`/`.setState()` — no mocking library, just calling the store's own API.
- **Wrap anything using `<Link>`/`useNavigate`/routing in `<MemoryRouter>`.** A component that renders a `Link` will throw ("Cannot destructure property 'basename' of ... useContext(...) as it is null") if rendered outside a Router context. Use a small `renderX(props)` helper per test file rather than repeating the wrapper inline.
- **Assert against store state, not just DOM, after an interaction.** `expect(useAuthStore.getState().schoolId).toBe(target.id)` — verifying the underlying state changed is often a stronger assertion than checking the DOM re-rendered.
- **`userEvent.setup()` per test**, not a shared instance across the file.
- **Query by role and accessible name** (`screen.getByRole('menuitem', { name: /add a school/i })`), not by test IDs or CSS selectors, wherever the component exposes proper ARIA semantics.

## What to test in a new module

Per [adding-a-module.md](./adding-a-module.md), a new page's test file should cover at minimum:

1. Renders with school-scoped data (assert something from the *active* school's roster is visible, and — if practical — that a different school's record is not).
2. The Add flow: fill the form, submit, assert the **new row appears in the table** — not just that a success toast fired. A toast with no state change is exactly the stub-button bug class this codebase has already been through once (see `TODOS.md`).
3. The Delete flow: trigger delete, confirm, assert the row is **gone** from the table.
4. If the module added a route: unauthorized roles get redirected (test `RoleProtectedRoute` behavior, or the page's own role gating if it self-checks).

## Related

- [adding-a-module.md](./adding-a-module.md) — where these conventions get applied to a real new page
- [architecture.md](./architecture.md) — `npm run test` in the full script list
