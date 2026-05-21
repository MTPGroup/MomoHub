import { Shield } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import type { SecurityState } from '../hooks/use-security'

export function OtpCard({ security }: { security: SecurityState }) {
  return (
    <Card className='gap-4 border border-border/80 bg-card/95 py-5 shadow-sm'>
      <CardHeader className='px-5'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <Shield className='size-4' />
          OTP 双因素认证
        </CardTitle>
        <CardDescription>
          流程：初始化 → 输入验证码 → 验证 → 启用。验证码需在你的认证器 App
          中获取。
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-3 px-5'>
        <Input
          value={security.form.otpCode}
          onChange={(event) =>
            security.form.setOtpCode(
              event.target.value.replace(/\D/g, '').slice(0, 6),
            )
          }
          placeholder='输入 6 位 OTP 验证码'
          inputMode='numeric'
        />
        <p className='text-xs text-muted-foreground'>
          步骤状态：{security.state.otpPrepared ? '已初始化' : '未初始化'} /{' '}
          {security.state.otpVerified ? '已验证' : '未验证'}
        </p>
        <div className='flex flex-wrap gap-2'>
          <Button variant='outline' onClick={security.actions.initOtp}>
            初始化 OTP
          </Button>
          <Button
            variant='outline'
            disabled={
              !security.state.otpPrepared ||
              security.form.otpCode.trim().length !== 6
            }
            onClick={security.actions.verifyOtp}
          >
            验证 OTP
          </Button>
          <Button
            disabled={!security.state.otpVerified}
            onClick={security.actions.enableOtp}
          >
            启用 OTP
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='destructive'>关闭 OTP</Button>
            </AlertDialogTrigger>
            <AlertDialogContent size='sm'>
              <AlertDialogHeader>
                <AlertDialogTitle>确认关闭 OTP？</AlertDialogTitle>
                <AlertDialogDescription>
                  关闭后账号安全等级会降低，建议仅在设备更换或排障时执行。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  variant='destructive'
                  onClick={security.actions.disableOtp}
                >
                  确认关闭
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
