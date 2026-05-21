import { Trash2 } from 'lucide-react'
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
import type { SecurityState } from '../hooks/use-security'

export function DangerZoneCard({ security }: { security: SecurityState }) {
  return (
    <Card className='gap-4 border border-destructive/30 bg-card py-5'>
      <CardHeader className='px-5'>
        <CardTitle className='text-base text-destructive'>危险操作</CardTitle>
        <CardDescription>
          注销后将立即清空当前登录态。若有重要数据，请先完成导出与备份。
        </CardDescription>
      </CardHeader>
      <CardContent className='px-5'>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant='destructive'>
              <Trash2 className='size-4' />
              注销账号
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认注销账号？</AlertDialogTitle>
              <AlertDialogDescription>
                注销后将退出登录并清空当前账户数据访问权限，该操作不可恢复。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                variant='destructive'
                onClick={security.actions.deleteAccount}
              >
                确认注销
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
