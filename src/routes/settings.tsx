import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { AuthRequired } from '#/components/shared/auth-required'
import { AuditLogPayloadDialog } from '#/features/settings/components/audit-log-payload-dialog'
import { AuditLogsCard } from '#/features/settings/components/audit-logs-card'
import { DangerZoneCard } from '#/features/settings/components/danger-zone-card'
import { LlmConfigsCard } from '#/features/settings/components/llm-configs-card'
import { OtpCard } from '#/features/settings/components/otp-card'
import { PasswordCard } from '#/features/settings/components/password-card'
import { SessionsCard } from '#/features/settings/components/sessions-card'
import { useAuditLogs } from '#/features/settings/hooks/use-audit-logs'
import { useLlmConfigs } from '#/features/settings/hooks/use-llm-configs'
import { useSecurity } from '#/features/settings/hooks/use-security'
import { useSessions } from '#/features/settings/hooks/use-sessions'
import type { AuditLogItem } from '#/features/settings/types'
import { useAuth } from '#/hooks/use-auth'

export const Route = createFileRoute('/settings')({ component: SettingsPage })

function SettingsPage() {
  const auth = useAuth()
  const navigate = useNavigate()

  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogItem | null>(
    null,
  )

  const sessions = useSessions(auth.isLoggedIn)
  const llmConfigs = useLlmConfigs(auth.isLoggedIn)
  const security = useSecurity({
    onAccountDeleted: () => navigate({ to: '/' }),
  })
  const auditLogs = useAuditLogs(auth.isLoggedIn)

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8'>
      <section className='space-y-3'>
        <h1 className='font-serif text-3xl font-bold tracking-tight'>
          账号设置
        </h1>
        <p className='max-w-3xl text-sm leading-6 text-muted-foreground'>
          设置您的密码、设备会话、OTP、模型配置与账号注销。
        </p>
      </section>

      <AuthRequired>
        <div className='grid gap-4 xl:grid-cols-2'>
          <PasswordCard security={security} />
          <OtpCard security={security} />
        </div>

        <SessionsCard sessions={sessions} />

        <LlmConfigsCard llmConfigs={llmConfigs} />

        <AuditLogsCard
          auditLogs={auditLogs}
          onSelectAuditLog={setSelectedAuditLog}
        />
        <AuditLogPayloadDialog
          auditLog={selectedAuditLog}
          onOpenChange={(open) => {
            if (!open) setSelectedAuditLog(null)
          }}
        />

        <DangerZoneCard security={security} />
      </AuthRequired>

      <p className='text-xs text-muted-foreground'>
        当前账号：{auth.name || '未命名用户'}，访问令牌状态：
        {auth.isLoggedIn ? '已登录' : '未登录'}。
      </p>
    </div>
  )
}
