import { Globe, Lock } from 'lucide-react'
import { cn } from '#/lib/utils'

interface PublicToggleProps {
  checked: boolean
  onCheckedChange: (next: boolean) => void
  publicLabel?: string
  privateLabel?: string
  className?: string
}

export function PublicToggle({
  checked,
  onCheckedChange,
  publicLabel = '公开',
  privateLabel = '私有',
  className,
}: PublicToggleProps) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'inline-flex items-center gap-3 rounded-full border px-2 py-1 text-xs transition-colors',
        checked
          ? 'border-primary/40 bg-primary text-primary-foreground'
          : 'border-border bg-muted/40 text-foreground',
        className,
      )}
    >
      <span
        className={cn(
          'flex size-6 items-center justify-center rounded-full',
          checked ? 'bg-primary-foreground/20' : 'bg-background',
        )}
      >
        {checked ? (
          <Globe className='size-3.5' />
        ) : (
          <Lock className='size-3.5' />
        )}
      </span>
      <span className='min-w-14 text-left font-medium'>
        {checked ? publicLabel : privateLabel}
      </span>
    </button>
  )
}
