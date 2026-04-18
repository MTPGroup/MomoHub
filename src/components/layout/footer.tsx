import { Icon } from '@iconify/react'
import { Button } from '#/components/ui/button'

export function Footer() {
  return (
    <footer className='border-t bg-background py-4'>
      <div className='flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8'>
        <p className='text-center text-sm text-muted-foreground md:text-left'>
          © {new Date().getFullYear()} Momohub. All rights reserved.
        </p>
        <Button variant='ghost' size='icon' className='rounded-full' asChild>
          <a
            href='https://github.com/MTPGroup/MomoHub'
            target='_blank'
            rel='noreferrer'
            aria-label='Github Repository'
          >
            <Icon icon='octicon:mark-github-24' className='size-6' />
          </a>
        </Button>
      </div>
    </footer>
  )
}
