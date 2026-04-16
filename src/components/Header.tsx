import { Link } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '#/components/ui/navigation-menu'
import { navLinks } from '#/lib/nav-links'
import { MobileNav } from './MobileNav'

export function Header() {
  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'>
      <div className='flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8'>
        {/* Logo */}
        <Link
          to='/'
          className='flex items-center gap-2 transition-opacity hover:opacity-80'
        >
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-sm'>
            M
          </div>
          <span className='hidden text-lg font-bold tracking-tight sm:inline-block'>
            Momohub
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className='hidden md:flex md:items-center md:gap-8'>
          <NavigationMenu>
            <NavigationMenuList className='gap-1'>
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.to}>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link to={link.to}>{link.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-3'>
          <Button
            variant='ghost'
            size='sm'
            className='hidden text-muted-foreground hover:text-foreground md:inline-flex'
          >
            Log in
          </Button>
          <Button size='sm' className='hidden md:inline-flex'>
            Get Started
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
