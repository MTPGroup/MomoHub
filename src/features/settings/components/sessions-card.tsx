import { LogOut } from 'lucide-react'
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
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { formatDateTime } from '#/lib/format'
import type { SessionsState } from '../hooks/use-sessions'

export function SessionsCard({ sessions }: { sessions: SessionsState }) {
  return (
    <Card className='gap-4 border border-border/80 bg-card/95 py-5 shadow-sm'>
      <CardHeader className='px-5'>
        <CardTitle className='text-base'>会话管理</CardTitle>
        <CardDescription>
          可单独下线某设备，或一键清理除当前会话外的所有设备。
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4 px-5'>
        <div className='flex flex-wrap gap-2'>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='outline'>下线其他所有设备</Button>
            </AlertDialogTrigger>
            <AlertDialogContent size='sm'>
              <AlertDialogHeader>
                <AlertDialogTitle>确认下线其他设备？</AlertDialogTitle>
                <AlertDialogDescription>
                  该操作会使除当前设备外的所有会话失效，需要重新登录。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  variant='destructive'
                  onClick={sessions.actions.deleteAllSessions}
                >
                  确认下线
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className='grid gap-3 md:grid-cols-2'>
          {sessions.data.sessions.map((session) => (
            <div
              key={session.sessionId}
              className='rounded-md border border-border/80 bg-background/70 p-3'
            >
              <div className='flex items-center justify-between gap-2'>
                <p className='text-sm font-medium'>
                  {session.isCurrent ? '当前设备' : '其他设备'}
                </p>
                <Badge variant={session.isCurrent ? 'secondary' : 'outline'}>
                  {session.identityType}
                </Badge>
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>
                指纹：{session.deviceFingerprint}
              </p>
              <p className='text-xs text-muted-foreground'>
                过期：{formatDateTime(session.expiresAt)}
              </p>
              {!session.isCurrent && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size='sm' variant='destructive' className='mt-2'>
                      <LogOut className='size-4' />
                      下线此设备
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size='sm'>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认下线该设备？</AlertDialogTitle>
                      <AlertDialogDescription>
                        会话指纹：{session.deviceFingerprint}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction
                        variant='destructive'
                        onClick={() =>
                          sessions.actions.deleteSession(session.sessionId)
                        }
                      >
                        确认下线
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
