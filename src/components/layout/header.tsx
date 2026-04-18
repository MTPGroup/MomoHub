import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  BadgeAlert,
  BadgeCheck,
  Book,
  LogOut,
  Settings,
  Sparkles,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { logoutMutation } from '#/client/@tanstack/react-query.gen'
import { AuthForm } from '#/components/features/auth/auth-form'
import { ThemeToggle } from '#/components/shared/theme-toggle'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '#/components/ui/navigation-menu'
import { siteConfig } from '#/env'
import { navLinks } from '#/lib/nav-links'
import { clearAuth, useAuth } from '#/stores/auth'
import { MobileNav } from './moblie-nav'

export function Header() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  const logout = useMutation({
    ...logoutMutation(),
    onSuccess: () => {
      clearAuth()
    },
    onError: (error) => {
      toast.error('登出失败', {
        description: error?.message,
      })
    },
  })

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'>
      <div className='flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8'>
        {/* Logo */}
        <Link
          to='/'
          className='flex items-center gap-2 transition-opacity hover:opacity-80'
        >
          <div className='flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-900 text-sm font-bold text-white shadow-sm'>
            M
          </div>
          <span className='hidden text-lg font-bold tracking-tight sm:inline-block'>
            {siteConfig.name}
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
          <ThemeToggle />
          <Avatar>
            {auth.accessToken ? (
              /* --- 已登录，显示下拉菜单 --- */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar>
                    <AvatarImage src={auth.avatar} alt={auth.name} />
                    <AvatarFallback className='border border-zinc-900 bg-zinc-900 text-white'>
                      {auth.name?.substring(0, 2).toUpperCase() || 'AZ'}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className='w-64'
                  align='end'
                  sideOffset={8}
                  forceMount
                >
                  {/*  用户信息页眉  */}
                  <DropdownMenuLabel className='font-normal'>
                    <div className='flex flex-col space-y-1 p-2'>
                      <div className='flex items-center gap-2'>
                        <p className='text-sm font-bold leading-none'>
                          {auth.name}
                        </p>
                        {auth.status === 'banned' ? (
                          <Badge variant='destructive'>
                            <BadgeAlert data-icon='inline-start' />
                            禁用
                          </Badge>
                        ) : (
                          <Badge variant='secondary'>
                            <BadgeCheck data-icon='inline-start' />
                            已验证
                          </Badge>
                        )}
                      </div>
                      <p className='text-xs leading-none text-muted-foreground truncate'>
                        {auth?.name || '已认证用户'}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {/* 个人空间组 */}
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => navigate({ to: '/profile' })}
                    >
                      <User className='mr-2 h-4 w-4 text-foreground' />
                      <span>个人资料</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate({ to: '/settings' })}
                    >
                      <Settings className='mr-2 h-4 w-4 text-foreground' />
                      <span>账号设置</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  {/* 业务功能组 */}
                  <DropdownMenuGroup title='我的应用'>
                    <DropdownMenuItem
                      onClick={() => navigate({ to: '/characters' })}
                    >
                      <Sparkles className='mr-2 h-4 w-4 text-foreground' />
                      <span>我的角色</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate({ to: '/knowledge-bases' })}
                    >
                      <Book className='mr-2 h-4 w-4 text-foreground' />
                      <span>我的知识库</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  {/* 危险操作区 */}
                  <DropdownMenuItem
                    className='text-red-500 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/30'
                    onSelect={(event) => {
                      event.preventDefault()
                      setLogoutConfirmOpen(true)
                    }}
                  >
                    <LogOut className='mr-2 h-4 w-4' />
                    <span>退出登录</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* 未登录，显示登录组件 */
              <AuthForm>
                <Avatar className='h-9 w-9'>
                  <AvatarFallback>登录</AvatarFallback>
                </Avatar>
              </AuthForm>
            )}
          </Avatar>
          <MobileNav />
        </div>
      </div>
      <AlertDialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <AlertDialogContent size='sm'>
          <AlertDialogHeader>
            <AlertDialogTitle>确认退出登录？</AlertDialogTitle>
            <AlertDialogDescription>
              退出后需要重新登录才能访问个人资料、知识库管理和角色管理功能。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              onClick={() => {
                logout.mutate({
                  body: null,
                })
              }}
            >
              确认退出
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}
