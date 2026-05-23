import { LockKeyhole } from 'lucide-react'
import { AuthForm } from '#/features/auth/components/auth-form'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

export function DocumentsAccessCard({
  isAuthenticated,
}: {
  isAuthenticated: boolean
}) {
  return (
    <Card className='gap-4 border-dashed bg-card py-5'>
      <CardHeader className='px-5'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <LockKeyhole className='size-4 text-muted-foreground' />
          {isAuthenticated ? '仅作者可管理文档' : '文档管理需要登录'}
        </CardTitle>
        <CardDescription>
          {isAuthenticated
            ? '你可以继续查看公开知识库信息；文档队列、上传和索引管理仅作者可操作。'
            : '你可以继续查看公开知识库信息；登录后如果你是作者，可查看文档队列、上传文件和管理索引。'}
        </CardDescription>
      </CardHeader>
      {!isAuthenticated && (
        <CardContent className='px-5'>
          <AuthForm redirectTo={false}>
            <Button type='button'>登录后管理文档</Button>
          </AuthForm>
        </CardContent>
      )}
    </Card>
  )
}
