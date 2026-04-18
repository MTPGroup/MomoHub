import type { ReactNode } from 'react'
import { AuthForm } from '#/components/features/auth/auth-form'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { useAuth } from '#/stores/auth'

interface AuthRequiredProps {
  children: ReactNode
  title?: string
  description?: string
}

export function AuthRequired({
  children,
  title = '需要登录后访问',
  description = '该功能依赖你的账号信息，请先登录。',
}: AuthRequiredProps) {
  const auth = useAuth()

  if (auth.accessToken) {
    return <>{children}</>
  }

  return (
    <Card className='mx-auto w-full max-w-xl border-dashed'>
      <CardHeader>
        <CardTitle className='text-base'>{title}</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col items-start gap-4 text-sm text-muted-foreground'>
        <p>{description}</p>
        <AuthForm>
          <Button variant='default'>立即登录</Button>
        </AuthForm>
      </CardContent>
    </Card>
  )
}
