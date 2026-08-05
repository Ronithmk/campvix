import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

function label(segment: string) {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function Breadcrumbs() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean).filter((s) => s !== 'app')

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link to="/app/dashboard" className="flex items-center hover:text-foreground">
        <Home className="size-3.5" />
      </Link>
      {segments.map((segment, i) => {
        const path = `/app/${segments.slice(0, i + 1).join('/')}`
        const isLast = i === segments.length - 1
        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight className="size-3.5" />
            {isLast ? (
              <span className="font-medium text-foreground">{label(segment)}</span>
            ) : (
              <Link to={path} className="hover:text-foreground">
                {label(segment)}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
