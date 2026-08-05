import { Component, type ReactNode } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function RouteLoadingFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )
}

interface RouteErrorBoundaryProps {
  children: ReactNode
}

interface RouteErrorBoundaryState {
  hasError: boolean
}

/**
 * Route-level lazy chunks can fail to load after a redeploy invalidates the
 * hashed chunk a still-open tab is pointing at. Suspense only covers the
 * loading state, not this failure — without a boundary here, that failure
 * is an unhandled render error and the user sees a blank white screen.
 */
export class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-foreground">This page couldn't load</p>
            <p className="max-w-sm text-sm text-muted-foreground">The app may have been updated since you opened this tab. Reloading usually fixes this.</p>
          </div>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="size-4" /> Reload page
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
