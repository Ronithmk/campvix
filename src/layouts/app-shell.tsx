import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { CommandPalette } from '@/components/layout/command-palette'
import { RouteErrorBoundary, RouteLoadingFallback } from '@/components/shared/route-boundary'

export function AppShell() {
  const location = useLocation()

  return (
    <div className="flex min-h-svh w-full bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="mx-auto w-full max-w-[1600px]"
            >
              <RouteErrorBoundary>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <Outlet />
                </Suspense>
              </RouteErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}
