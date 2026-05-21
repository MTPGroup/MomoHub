import { KeyRound } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import type { SecurityState } from '../hooks/use-security'

export function PasswordCard({ security }: { security: SecurityState }) {
  return (
    <Card className='gap-4 border border-border/80 bg-card/95 py-5 shadow-sm'>
      <CardHeader className='px-5'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <KeyRound className='size-4' />
          修改密码
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3 px-5'>
        <Input
          type='password'
          value={security.form.oldPassword}
          onChange={(event) => security.form.setOldPassword(event.target.value)}
          placeholder='当前密码'
        />
        <Input
          type='password'
          value={security.form.newPassword}
          onChange={(event) => security.form.setNewPassword(event.target.value)}
          placeholder='新密码（至少 6 位）'
        />
        <Button
          onClick={security.actions.changePassword}
          disabled={security.state.isChanging}
        >
          {security.state.isChanging ? '提交中...' : '更新密码'}
        </Button>
      </CardContent>
    </Card>
  )
}
