import { Eye } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { formatDateTime } from '#/lib/format'
import type { AuditLogsState } from '../hooks/use-audit-logs'
import type { AuditLogItem } from '../types'
import { maskId } from '../utils'

export function AuditLogsCard({
  auditLogs,
  onSelectAuditLog,
}: {
  auditLogs: AuditLogsState
  onSelectAuditLog: (item: AuditLogItem) => void
}) {
  return (
    <Card className='gap-4 border border-border/80 bg-card/95 py-5 shadow-sm'>
      <CardHeader className='px-5'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <Eye className='size-4' />
          审计日志
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3 px-5'>
        <p className='text-xs text-muted-foreground'>
          共 {auditLogs.data.auditTotal} 条 · 第 {auditLogs.data.auditPage}/
          {auditLogs.data.auditTotalPages} 页 · 每页{' '}
          {auditLogs.data.auditPageSize} 条
        </p>
        {auditLogs.state.isLoading ? (
          <p className='text-sm text-muted-foreground'>审计日志加载中...</p>
        ) : auditLogs.data.auditItems.length === 0 ? (
          <p className='text-sm text-muted-foreground'>暂无审计日志</p>
        ) : (
          <div className='space-y-3'>
            {auditLogs.data.auditItems.map((item) => (
              <div
                key={item.id}
                className='rounded-md border border-border/80 bg-background/70 p-3'
              >
                <div className='flex items-center justify-between gap-2'>
                  <p className='text-sm font-medium'>{item.eventType}</p>
                  <Badge variant={item.processed ? 'secondary' : 'outline'}>
                    {item.processed ? '已处理' : '待处理'}
                  </Badge>
                </div>
                <div className='mt-1 space-y-1 text-xs text-muted-foreground'>
                  <p>事件ID：{maskId(item.id)}</p>
                  <p>重试次数：{item.retryCount ?? 0}</p>
                  <p>创建时间：{formatDateTime(item.createdAt)}</p>
                  <p>发布时间：{formatDateTime(item.publishedAt)}</p>
                </div>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  className='mt-2'
                  onClick={() => onSelectAuditLog(item)}
                >
                  查看 payload
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
