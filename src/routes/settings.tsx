import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Eye, KeyRound, LogOut, Plus, Shield, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  changePasswordMutation,
  createLlmConfigMutation,
  deleteAccountMutation,
  deleteAllSessionsMutation,
  deleteLlmConfigMutation,
  deleteSessionMutation,
  disableOtpMutation,
  enableOtpMutation,
  getAuditLogsOptions,
  listMyLlmConfigsOptions,
  listMyLlmConfigsQueryKey,
  listSessionsOptions,
  listSessionsQueryKey,
  setupOtpOptions,
  updateLlmConfigMutation,
  verifyOtpMutation,
} from '#/client/@tanstack/react-query.gen'
import type { LlmConfigOut } from '#/client/types.gen'
import { AuthRequired } from '#/components/shared/auth-required'
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
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { formatDateTime } from '#/lib/format'
import { clearAuth, useAuth } from '#/stores/auth'

export const Route = createFileRoute('/settings')({ component: SettingsPage })

interface SessionItem {
  sessionId: string
  identityType: string
  deviceFingerprint: string
  expiresAt: string
  isCurrent: boolean
}

function SettingsPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [otpCode, setOtpCode] = useState('')
  const [otpPrepared, setOtpPrepared] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)

  const [llmName, setLlmName] = useState('')
  const [llmProvider, setLlmProvider] = useState('openai')
  const [llmModel, setLlmModel] = useState('gpt-4.1')
  const [llmBaseUrl, setLlmBaseUrl] = useState('')

  const [editingLlmId, setEditingLlmId] = useState<string | null>(null)

  const sessionsQuery = useQuery(listSessionsOptions())
  const llmConfigsQuery = useQuery(listMyLlmConfigsOptions())
  const auditLogsQuery = useQuery(getAuditLogsOptions())

  const changePassword = useMutation({
    ...changePasswordMutation(),
    onSuccess: () => {
      toast.success('密码修改成功')
      setOldPassword('')
      setNewPassword('')
    },
    onError: (error) => {
      toast.error('密码修改失败', { description: error.message || '请稍后重试' })
    },
  })

  const deleteSession = useMutation({
    ...deleteSessionMutation(),
    onSuccess: () => {
      toast.success('设备会话已下线')
      queryClient.invalidateQueries({ queryKey: listSessionsQueryKey() })
    },
    onError: (error) => {
      toast.error('操作失败', { description: error.message || '请稍后重试' })
    },
  })

  const deleteAllSessions = useMutation({
    ...deleteAllSessionsMutation(),
    onSuccess: () => {
      toast.success('其他设备已全部下线')
      queryClient.invalidateQueries({ queryKey: listSessionsQueryKey() })
    },
    onError: (error) => {
      toast.error('操作失败', { description: error.message || '请稍后重试' })
    },
  })

  const verifyOtp = useMutation({
    ...verifyOtpMutation(),
    onSuccess: () => {
      toast.success('OTP 验证成功')
      setOtpVerified(true)
    },
    onError: (error) => {
      toast.error('OTP 验证失败', { description: error.message || '请稍后重试' })
    },
  })

  const enableOtp = useMutation({
    ...enableOtpMutation(),
    onSuccess: () => {
      toast.success('已启用 OTP')
    },
    onError: (error) => {
      toast.error('启用失败', { description: error.message || '请稍后重试' })
    },
  })

  const disableOtp = useMutation({
    ...disableOtpMutation(),
    onSuccess: () => {
      toast.success('已关闭 OTP')
      setOtpPrepared(false)
      setOtpVerified(false)
      setOtpCode('')
    },
    onError: (error) => {
      toast.error('关闭失败', { description: error.message || '请稍后重试' })
    },
  })

  const createLlmConfig = useMutation({
    ...createLlmConfigMutation(),
    onSuccess: () => {
      toast.success('模型配置已创建')
      setLlmName('')
      setLlmProvider('openai')
      setLlmModel('gpt-4.1')
      setLlmBaseUrl('')
      queryClient.invalidateQueries({ queryKey: listMyLlmConfigsQueryKey() })
    },
    onError: (error) => {
      toast.error('创建失败', { description: error.message || '请稍后重试' })
    },
  })

  const updateLlmConfig = useMutation({
    ...updateLlmConfigMutation(),
    onSuccess: () => {
      toast.success('模型配置已更新')
      setEditingLlmId(null)
      queryClient.invalidateQueries({ queryKey: listMyLlmConfigsQueryKey() })
    },
    onError: (error) => {
      toast.error('更新失败', { description: error.message || '请稍后重试' })
    },
  })

  const deleteLlmConfig = useMutation({
    ...deleteLlmConfigMutation(),
    onSuccess: () => {
      toast.success('模型配置已删除')
      queryClient.invalidateQueries({ queryKey: listMyLlmConfigsQueryKey() })
    },
    onError: (error) => {
      toast.error('删除失败', { description: error.message || '请稍后重试' })
    },
  })

  const deleteAccount = useMutation({
    ...deleteAccountMutation(),
    onSuccess: () => {
      toast.success('账号已注销')
      clearAuth()
      navigate({ to: '/' })
    },
    onError: (error) => {
      toast.error('注销失败', { description: error.message || '请稍后重试' })
    },
  })

  const sessions = (sessionsQuery.data as { data?: SessionItem[] | null } | undefined)
    ?.data ?? []
  const llmConfigs =
    (llmConfigsQuery.data as { data?: LlmConfigOut[] | null } | undefined)?.data ??
    []

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword) {
      toast.error('请填写完整密码信息')
      return
    }

    changePassword.mutate({
      body: {
        oldPassword,
        newPassword,
      },
    })
  }

  const handleCreateLlmConfig = () => {
    if (!llmName.trim() || !llmProvider.trim() || !llmModel.trim()) {
      toast.error('请填写完整模型配置')
      return
    }

    createLlmConfig.mutate({
      body: {
        name: llmName.trim(),
        provider: llmProvider.trim(),
        model: llmModel.trim(),
        baseUrl: llmBaseUrl.trim() || null,
      },
    })
  }

  const handleToggleLlmActive = (configId: string, isActive: boolean) => {
    updateLlmConfig.mutate({
      path: { config_id: configId },
      body: { isActive: !isActive },
    })
  }

  const auditPreview =
    typeof auditLogsQuery.data === 'string'
      ? auditLogsQuery.data
      : JSON.stringify(auditLogsQuery.data ?? {}, null, 2)

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8'>
      <section className='space-y-3'>
        <h1 className='font-serif text-3xl font-bold tracking-tight'>账号设置</h1>
        <p className='max-w-3xl text-sm leading-6 text-muted-foreground'>
          覆盖安全和账号层面的关键能力：密码、设备会话、OTP、模型配置与账号注销。
        </p>
      </section>

      <AuthRequired>
        <div className='grid gap-4 xl:grid-cols-2'>
          <Card className='gap-4 border bg-card py-5'>
            <CardHeader className='px-5'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <KeyRound className='size-4' />
                修改密码
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 px-5'>
              <Input
                type='password'
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
                placeholder='当前密码'
              />
              <Input
                type='password'
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder='新密码（至少 6 位）'
              />
              <Button onClick={handleChangePassword} disabled={changePassword.isPending}>
                {changePassword.isPending ? '提交中...' : '更新密码'}
              </Button>
            </CardContent>
          </Card>

          <Card className='gap-4 border bg-card py-5'>
            <CardHeader className='px-5'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Shield className='size-4' />
                OTP 双因素认证
              </CardTitle>
              <CardDescription>
                流程：初始化 → 输入验证码 → 验证 → 启用。验证码需在你的认证器 App 中获取。
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3 px-5'>
              <Input
                value={otpCode}
                onChange={(event) =>
                  setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                }
                placeholder='输入 6 位 OTP 验证码'
                inputMode='numeric'
              />
              <p className='text-xs text-muted-foreground'>
                步骤状态：{otpPrepared ? '已初始化' : '未初始化'} /{' '}
                {otpVerified ? '已验证' : '未验证'}
              </p>
              <div className='flex flex-wrap gap-2'>
                <Button
                  variant='outline'
                  onClick={async () => {
                    try {
                      await queryClient.fetchQuery(setupOtpOptions())
                      toast.success('OTP 初始化成功，请继续验证并启用')
                      setOtpPrepared(true)
                      setOtpVerified(false)
                    } catch (error) {
                      const message =
                        error instanceof Error ? error.message : '请稍后重试'
                      toast.error('OTP 初始化失败', { description: message })
                    }
                  }}
                >
                  初始化 OTP
                </Button>
                <Button
                  variant='outline'
                  disabled={!otpPrepared || otpCode.trim().length !== 6}
                  onClick={() => verifyOtp.mutate({})}
                >
                  验证 OTP
                </Button>
                <Button disabled={!otpVerified} onClick={() => enableOtp.mutate({})}>
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
                        onClick={() => disableOtp.mutate({})}
                      >
                        确认关闭
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className='gap-4 border bg-card py-5'>
          <CardHeader className='px-5'>
            <CardTitle className='text-base'>会话管理</CardTitle>
            <CardDescription>可单独下线某设备，或一键清理除当前会话外的所有设备。</CardDescription>
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
                      onClick={() => deleteAllSessions.mutate({})}
                    >
                      确认下线
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className='grid gap-3 md:grid-cols-2'>
              {sessions.map((session) => (
                <div key={session.sessionId} className='rounded-md border bg-background p-3'>
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
                              deleteSession.mutate({
                                path: { session_id: session.sessionId },
                              })
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

        <Card className='gap-4 border bg-card py-5'>
          <CardHeader className='px-5'>
            <CardTitle className='text-base'>LLM 配置管理</CardTitle>
            <CardDescription>
              支持创建、启停、删除模型配置。后续可在会话创建时按配置切换模型。
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4 px-5'>
            <div className='grid gap-3 md:grid-cols-4'>
              <Input
                value={llmName}
                onChange={(event) => setLlmName(event.target.value)}
                placeholder='配置名称'
              />
              <Input
                value={llmProvider}
                onChange={(event) => setLlmProvider(event.target.value)}
                placeholder='provider'
              />
              <Input
                value={llmModel}
                onChange={(event) => setLlmModel(event.target.value)}
                placeholder='model'
              />
              <Input
                value={llmBaseUrl}
                onChange={(event) => setLlmBaseUrl(event.target.value)}
                placeholder='baseUrl（可选）'
              />
            </div>
            <Button onClick={handleCreateLlmConfig}>
              <Plus className='size-4' />
              新增模型配置
            </Button>

            <div className='grid gap-3 md:grid-cols-2'>
              {llmConfigs.map((item) => (
                <div key={item.id} className='rounded-md border bg-background p-3'>
                  <div className='flex items-center justify-between gap-2'>
                    <p className='text-sm font-medium'>{item.name}</p>
                    <Badge variant={item.isActive ? 'secondary' : 'outline'}>
                      {item.isActive ? '活跃' : '未启用'}
                    </Badge>
                  </div>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    {item.provider} / {item.model}
                  </p>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleToggleLlmActive(item.id, item.isActive)}
                    >
                      {item.isActive ? '设为非活跃' : '设为活跃'}
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => {
                        setEditingLlmId(item.id)
                        setLlmName(item.name)
                        setLlmProvider(item.provider)
                        setLlmModel(item.model)
                        setLlmBaseUrl(item.baseUrl || '')
                      }}
                    >
                      编辑
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size='sm' variant='destructive'>
                          删除
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent size='sm'>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除模型配置？</AlertDialogTitle>
                          <AlertDialogDescription>
                            将删除配置「{item.name}」，已关联会话可能需要重新选择模型。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            variant='destructive'
                            onClick={() =>
                              deleteLlmConfig.mutate({
                                path: { config_id: item.id },
                              })
                            }
                          >
                            确认删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>

            {editingLlmId && (
              <div className='rounded-md border border-dashed p-3'>
                <p className='mb-3 text-sm font-medium'>编辑配置：{editingLlmId}</p>
                <div className='grid gap-3 md:grid-cols-4'>
                  <Input
                    value={llmName}
                    onChange={(event) => setLlmName(event.target.value)}
                    placeholder='配置名称'
                  />
                  <Input
                    value={llmProvider}
                    onChange={(event) => setLlmProvider(event.target.value)}
                    placeholder='provider'
                  />
                  <Input
                    value={llmModel}
                    onChange={(event) => setLlmModel(event.target.value)}
                    placeholder='model'
                  />
                  <Input
                    value={llmBaseUrl}
                    onChange={(event) => setLlmBaseUrl(event.target.value)}
                    placeholder='baseUrl（可选）'
                  />
                </div>
                <div className='mt-3 flex flex-wrap gap-2'>
                  <Button
                    onClick={() =>
                      updateLlmConfig.mutate({
                        path: { config_id: editingLlmId },
                        body: {
                          name: llmName.trim(),
                          provider: llmProvider.trim(),
                          model: llmModel.trim(),
                          baseUrl: llmBaseUrl.trim() || null,
                        },
                      })
                    }
                  >
                    保存更新
                  </Button>
                  <Button variant='ghost' onClick={() => setEditingLlmId(null)}>
                    取消
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className='gap-4 border bg-card py-5'>
          <CardHeader className='px-5'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Eye className='size-4' />
              审计日志预览
            </CardTitle>
            <CardDescription>用于快速查看接口返回结构，便于后续做更细粒度的日志 UI。</CardDescription>
          </CardHeader>
          <CardContent className='px-5'>
            <Textarea
              readOnly
              value={auditPreview.slice(0, 2400)}
              className='min-h-56 font-mono text-xs'
            />
          </CardContent>
        </Card>

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
                    onClick={() => deleteAccount.mutate({})}
                  >
                    确认注销
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </AuthRequired>

      <p className='text-xs text-muted-foreground'>
        当前账号：{auth.name || '未命名用户'}，访问令牌状态：
        {auth.accessToken ? '已登录' : '未登录'}。
      </p>
    </div>
  )
}
