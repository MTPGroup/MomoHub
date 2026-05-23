import type { ComponentProps, ReactNode } from 'react'
import { AuthForm } from '#/features/auth/components/auth-form'
import { Button } from '#/components/ui/button'

type AuthActionButtonProps = Omit<ComponentProps<typeof Button>, 'onClick'> & {
  isAuthenticated: boolean
  isAuthReady?: boolean
  isAllowed?: boolean
  loginLabel?: ReactNode
  loadingLabel?: ReactNode
  unauthorizedLabel?: ReactNode
  onClick?: () => void
}

export function AuthActionButton({
  isAuthenticated,
  isAuthReady = true,
  isAllowed = true,
  loginLabel,
  loadingLabel = '账号状态加载中...',
  unauthorizedLabel,
  children,
  disabled,
  onClick,
  ...buttonProps
}: AuthActionButtonProps) {
  if (!isAuthReady) {
    return (
      <Button {...buttonProps} disabled>
        {loadingLabel}
      </Button>
    )
  }

  if (!isAuthenticated) {
    return (
      <AuthForm redirectTo={false}>
        <Button {...buttonProps}>{loginLabel ?? children}</Button>
      </AuthForm>
    )
  }

  if (!isAllowed) {
    return (
      <Button {...buttonProps} disabled>
        {unauthorizedLabel ?? children}
      </Button>
    )
  }

  return (
    <Button {...buttonProps} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  )
}
