import { X } from 'lucide-react'
import { type KeyboardEvent, useMemo, useState } from 'react'
import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'

type TagInputProps = {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  maxTags?: number
  disabled?: boolean
  className?: string
}

function normalizeTag(raw: string) {
  return raw.trim().replace(/\s+/g, ' ')
}

function hasTag(tags: string[], candidate: string) {
  const lowered = candidate.toLowerCase()
  return tags.some((tag) => tag.toLowerCase() === lowered)
}

export function TagInput({
  value,
  onChange,
  placeholder = '输入标签后按回车添加',
  maxTags = 10,
  disabled = false,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const canAddMore = value.length < maxTags

  const inputPlaceholder = useMemo(() => {
    if (disabled) {
      return ''
    }
    if (!canAddMore) {
      return `最多 ${maxTags} 个标签`
    }
    return placeholder
  }, [canAddMore, disabled, maxTags, placeholder])

  const appendTag = (raw: string) => {
    if (disabled || !canAddMore) {
      return
    }
    const next = normalizeTag(raw)
    if (!next || hasTag(value, next)) {
      return
    }
    onChange([...value, next])
  }

  const removeTag = (tag: string) => {
    if (disabled) {
      return
    }
    onChange(value.filter((item) => item !== tag))
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      appendTag(inputValue)
      setInputValue('')
      return
    }
    if (event.key === 'Backspace' && !inputValue && value.length > 0) {
      event.preventDefault()
      onChange(value.slice(0, -1))
    }
  }

  const onBlur = () => {
    if (!inputValue.trim()) {
      return
    }
    appendTag(inputValue)
    setInputValue('')
  }

  return (
    <div
      className={cn(
        'flex min-h-10 flex-wrap items-center gap-2 rounded-md border px-3 py-2',
        'bg-background transition-colors focus-within:border-ring',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      {value.map((tag) => (
        <Badge
          key={tag}
          variant='secondary'
          className='h-7 gap-1 rounded-full px-2.5'
        >
          <span className='max-w-[180px] truncate'>{tag}</span>
          <button
            type='button'
            aria-label={`删除标签 ${tag}`}
            className='inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            onClick={() => removeTag(tag)}
            disabled={disabled}
          >
            <X className='size-3' />
          </button>
        </Badge>
      ))}
      <input
        type='text'
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        disabled={disabled || !canAddMore}
        placeholder={inputPlaceholder}
        className='h-7 min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
      />
    </div>
  )
}
