import { Search } from 'lucide-react'
import { Input } from '#/components/ui/input'

type SearchBarProps = {
  query: string
  onQueryChange: (v: string) => void
  placeholder: string
  rounded: 'lg' | 'md' | 'xl'
}

export function SearchBar({
  query,
  onQueryChange,
  placeholder,
  rounded,
}: SearchBarProps) {
  return (
    <section className='relative'>
      <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
      <Input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={placeholder}
        className={`rounded-${rounded} border-border/80 bg-card/70 pl-10 shadow-none`}
      />
    </section>
  )
}
