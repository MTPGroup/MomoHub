import { Settings2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet'

interface ResponsiveActionPanelProps {
  title: string
  description?: string
  renderActions: (closeMobilePanel: () => void) => ReactNode
  mobileFabAriaLabel?: string
}

export function ResponsiveActionPanel({
  title,
  description = '常用管理操作集中在此。',
  renderActions,
  mobileFabAriaLabel = '打开操作面板',
}: ResponsiveActionPanelProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <aside className='hidden xl:sticky xl:top-24 xl:block xl:self-start'>
        <Card className='gap-4 border bg-card py-5'>
          <CardHeader className='px-5'>
            <CardTitle className='text-base'>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2 px-5'>
            {renderActions(() => {})}
          </CardContent>
        </Card>
      </aside>

      <Button
        type='button'
        size='icon'
        className='fixed z-40 rounded-full shadow-lg xl:hidden'
        style={{
          right: 'calc(env(safe-area-inset-right, 0px) + 1rem)',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)',
        }}
        aria-label={mobileFabAriaLabel}
        onClick={() => setMobileOpen(true)}
      >
        <Settings2 className='size-5' />
      </Button>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side='bottom'
          className='h-auto rounded-t-2xl pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]'
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div className='mt-4 space-y-2 px-4'>
            {renderActions(() => setMobileOpen(false))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
