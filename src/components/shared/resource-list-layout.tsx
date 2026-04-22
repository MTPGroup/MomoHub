import type { ReactNode } from 'react'
import { SearchBar } from './search-bar'

interface ResourceListLayoutProps {
  title: string
  description: string
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  createTitle: string
  createDescription: string
  createAction: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function ResourceListLayout({
  title,
  description,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  createTitle,
  createDescription,
  createAction,
  children,
  footer,
}: ResourceListLayoutProps) {
  return (
    <div className='mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8'>
      <section className='space-y-3'>
        <h1 className='font-serif text-3xl font-bold tracking-tight'>
          {title}
        </h1>
        <p className='max-w-3xl text-sm leading-6 text-muted-foreground'>
          {description}
        </p>
      </section>

      <SearchBar
        query={searchValue}
        onQueryChange={onSearchChange}
        placeholder={searchPlaceholder}
        rounded='lg'
      />

      <section className='flex items-center justify-between rounded-2xl border border-border/80 bg-card/95 p-5 shadow-sm'>
        <div className='space-y-1'>
          <p className='text-sm font-medium'>{createTitle}</p>
          <p className='text-xs text-muted-foreground'>{createDescription}</p>
        </div>
        {createAction}
      </section>

      {children}

      {footer}
    </div>
  )
}
