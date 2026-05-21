import { RefreshCcw } from 'lucide-react'
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
import type { DocumentStates } from '../hooks/use-document'
import {
  canRetryDocument,
  formatBytes,
  getDocumentStatusBadgeClassName,
  isDocumentProcessing,
  normalizeDocumentStatus,
} from '../utils'

export function DocumentsCard({
  kbId,
  documents,
}: {
  kbId: string
  documents: DocumentStates
}) {
  return (
    <Card className='gap-4 border bg-card py-5'>
      <CardHeader className='px-5'>
        <CardTitle className='text-base'>文档处理队列</CardTitle>
        <CardDescription>当前知识库 ID：{kbId}。</CardDescription>
      </CardHeader>
      <CardContent className='space-y-3 px-5'>
        {documents.state.showPollingHint && (
          <p className='text-xs text-muted-foreground'>文档状态刷新中...</p>
        )}
        {documents.data.documents.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            当前知识库暂无文档记录
          </p>
        ) : (
          <div className='space-y-2'>
            {documents.data.documents.map((doc) => (
              <div
                key={doc.id}
                className='rounded-md border bg-background p-3 text-sm'
              >
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <p className='font-medium'>{doc.fileName}</p>
                  <Badge
                    variant='outline'
                    className={getDocumentStatusBadgeClassName(doc.status)}
                  >
                    {doc.status}
                  </Badge>
                </div>
                <p className='mt-1 text-xs text-muted-foreground'>
                  类型：{doc.fileType} / 大小：{formatBytes(doc.fileSize)} /
                  片段：{doc.chunkCount}
                </p>
                <p className='text-xs text-muted-foreground'>
                  更新时间：{formatDateTime(doc.updatedAt)}
                </p>
                {doc.errorMessage && (
                  <p className='mt-1 text-xs text-destructive'>
                    失败原因：{doc.errorMessage}
                  </p>
                )}
                {isDocumentProcessing(normalizeDocumentStatus(doc.status)) && (
                  <p className='mt-1 text-xs text-muted-foreground'>
                    文档处理中，暂不可删除
                  </p>
                )}
                <div className='mt-2 flex flex-wrap gap-2'>
                  {canRetryDocument(doc.status) && (
                    <Button
                      type='button'
                      size='sm'
                      variant='outline'
                      onClick={() => documents.actions.retry(doc.id)}
                      disabled={documents.state.isRetrying}
                    >
                      <RefreshCcw className='size-3.5' />
                      重试处理
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type='button'
                        size='sm'
                        variant='destructive'
                        disabled={
                          documents.state.isDeleting ||
                          isDocumentProcessing(
                            normalizeDocumentStatus(doc.status),
                          )
                        }
                      >
                        删除文档
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent size='sm'>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认删除文档？</AlertDialogTitle>
                        <AlertDialogDescription>
                          删除后文档索引会被移除：{doc.fileName}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                          variant='destructive'
                          onClick={() => documents.actions.delete(doc.id)}
                        >
                          确认删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  {documents.state.deleteFailedDocId === doc.id && (
                    <Button
                      type='button'
                      size='sm'
                      variant='outline'
                      onClick={() => documents.actions.delete(doc.id)}
                      disabled={documents.state.isDeleting}
                    >
                      重试删除
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
