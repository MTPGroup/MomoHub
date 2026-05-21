import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import type { AuditLogItem } from '../types'
import { sanitizePayload } from '../utils'

export function AuditLogPayloadDialog({
  auditLog,
  onOpenChange,
}: {
  auditLog: AuditLogItem | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={Boolean(auditLog)} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{auditLog?.eventType || '审计日志 payload'}</DialogTitle>
          <DialogDescription>敏感字段已做基础脱敏展示。</DialogDescription>
        </DialogHeader>
        <pre className='max-h-[60vh] overflow-auto rounded-md border border-border/80 bg-background/70 p-3 text-xs leading-5'>
          {JSON.stringify(sanitizePayload(auditLog?.payload ?? {}), null, 2)}
        </pre>
      </DialogContent>
    </Dialog>
  )
}
