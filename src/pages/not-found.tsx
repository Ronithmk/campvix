import { Link } from 'react-router-dom'
import { CompassIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <CompassIcon className="size-8" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
      </div>
      <Button asChild className="mt-2">
        <Link to="/app/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  )
}
