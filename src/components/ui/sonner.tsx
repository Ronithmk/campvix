import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { useTheme } from 'next-themes'

function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      theme={(resolvedTheme as ToasterProps['theme']) ?? 'system'}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'bg-card! text-foreground! border-border! rounded-xl! shadow-lg!',
          description: 'text-muted-foreground!',
          actionButton: 'bg-primary! text-primary-foreground!',
          cancelButton: 'bg-secondary! text-secondary-foreground!',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
