import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Camera,
  FileUp,
  PencilLine,
  RefreshCcw,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  deleteDocumentMutation,
  deleteKbMutation,
  getKbOptions,
  getKbQueryKey,
  listDocumentsOptions,
  listDocumentsQueryKey,
  listKbsQueryKey,
  retryDocumentMutation,
  updateKbMutation,
  uploadDocumentMutation,
  uploadKbAvatarMutation,
} from '#/client/@tanstack/react-query.gen'
import type { KnowledgeDocumentOut } from '#/client/types.gen'
import { AuthRequired } from '#/components/shared/auth-required'
import { PublicToggle } from '#/components/shared/public-toggle'
import { ResponsiveActionPanel } from '#/components/shared/responsive-action-panel'
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
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { formatDateTime } from '#/lib/format'
import { useAuth } from '#/stores/auth'

export const Route = createFileRoute('/knowledge-bases/$id')({
  component: KnowledgeBaseDetailPage,
})

const DOCUMENT_POLL_INTERVAL_MS = 4000

function normalizeDocumentStatus(status?: string | null) {
  return status?.toLowerCase() ?? ''
}

function isDocumentSuccess(status: string) {
  return (
    status.includes('success') ||
    status.includes('done') ||
    status.includes('completed')
  )
}

function isDocumentFailed(status: string) {
  return (
    status.includes('fail') ||
    status.includes('error') ||
    status.includes('rejected')
  )
}

function isDocumentProcessing(status: string) {
  return (
    status.includes('processing') ||
    status.includes('pending') ||
    status.includes('queued') ||
    status.includes('running')
  )
}

function canRetryDocument(status: string) {
  return isDocumentFailed(normalizeDocumentStatus(status))
}

function getDocumentStatusBadgeClassName(status: string) {
  const normalized = normalizeDocumentStatus(status)
  if (isDocumentSuccess(normalized)) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (isDocumentFailed(normalized)) {
    return 'border-red-200 bg-red-50 text-red-700'
  }
  if (isDocumentProcessing(normalized)) {
    return 'border-blue-200 bg-blue-50 text-blue-700'
  }
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

function formatBytes(bytes?: number | null) {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) {
    return '-'
  }
  if (bytes < 1024) {
    return `${bytes} B`
  }

  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  const decimals = value >= 100 ? 0 : value >= 10 ? 1 : 2
  return `${value.toFixed(decimals)} ${units[unitIndex]}`
}

function useDebouncedBoolean(value: boolean, delayMs: number) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(value)
    }, delayMs)
    return () => {
      window.clearTimeout(timer)
    }
  }, [value, delayMs])

  return debounced
}

function revokeObjectUrl(url: string) {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

function getInitialChar(value?: string | null) {
  const text = value?.trim()
  return text ? text.slice(0, 1).toUpperCase() : 'K'
}

function KnowledgeBaseDetailPage() {
  const { id } = Route.useParams()
  const auth = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const editAvatarInputRef = useRef<HTMLInputElement | null>(null)

  const [editingOpen, setEditingOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editPublic, setEditPublic] = useState(false)
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null)
  const [editAvatarPreviewUrl, setEditAvatarPreviewUrl] = useState('')
  const [deleteFailedDocId, setDeleteFailedDocId] = useState<string | null>(
    null,
  )

  const clearEditAvatarSelection = (nextPreview = '') => {
    setEditAvatarFile(null)
    setEditAvatarPreviewUrl((previous) => {
      revokeObjectUrl(previous)
      return nextPreview
    })
    if (editAvatarInputRef.current) {
      editAvatarInputRef.current.value = ''
    }
  }

  useEffect(() => {
    return () => {
      revokeObjectUrl(editAvatarPreviewUrl)
    }
  }, [editAvatarPreviewUrl])

  const kbQuery = useQuery({
    ...getKbOptions({
      path: { id },
    }),
    enabled: Boolean(auth.accessToken),
  })

  const documentsQuery = useQuery({
    ...listDocumentsOptions({
      path: { id },
    }),
    enabled: Boolean(auth.accessToken),
    placeholderData: (previousData) => previousData,
    refetchInterval: (query) => {
      const docs =
        (query.state.data?.data as KnowledgeDocumentOut[] | null | undefined) ??
        []
      return docs.some((doc) =>
        isDocumentProcessing(normalizeDocumentStatus(doc.status)),
      )
        ? DOCUMENT_POLL_INTERVAL_MS
        : false
    },
  })

  const updateKb = useMutation({
    ...updateKbMutation(),
    onSuccess: async () => {
      if (editAvatarFile) {
        try {
          await uploadKbAvatar.mutateAsync({
            path: { id },
            body: { file: editAvatarFile },
          })
          toast.success('知识库头像已上传')
        } catch (error) {
          toast.warning('知识库信息已保存，但头像上传失败', {
            description:
              error instanceof Error ? error.message : '请稍后重试上传头像',
          })
        }
      }
      toast.success('知识库已更新')
      setEditingOpen(false)
      clearEditAvatarSelection()
      queryClient.invalidateQueries({
        queryKey: getKbQueryKey({ path: { id } }),
      })
      queryClient.invalidateQueries({ queryKey: listKbsQueryKey() })
    },
    onError: (error) => {
      toast.error('更新失败', { description: error.message || '请稍后重试' })
    },
  })
  const uploadKbAvatar = useMutation({
    ...uploadKbAvatarMutation(),
  })

  const deleteKb = useMutation({
    ...deleteKbMutation(),
    onSuccess: async () => {
      toast.success('知识库已删除')
      await queryClient.invalidateQueries({ queryKey: listKbsQueryKey() })
      void navigate({ to: '/knowledge-bases' })
    },
    onError: (error) => {
      toast.error('删除失败', { description: error.message || '请稍后重试' })
    },
  })

  const uploadDocument = useMutation({
    ...uploadDocumentMutation(),
    onSuccess: (res) => {
      const doc = res.data
      toast.success('文档已提交处理队列', {
        description: doc
          ? `${doc.fileName}（状态：${doc.status}）`
          : '请稍后查看文档处理状态',
      })
      queryClient.invalidateQueries({
        queryKey: getKbQueryKey({ path: { id } }),
      })
      queryClient.invalidateQueries({
        queryKey: listDocumentsQueryKey({ path: { id } }),
      })
      queryClient.invalidateQueries({ queryKey: listKbsQueryKey() })
    },
    onError: (error) => {
      toast.error('上传失败', { description: error.message || '请稍后重试' })
    },
  })

  const retryDocument = useMutation({
    ...retryDocumentMutation(),
    onSuccess: () => {
      toast.success('已重新提交文档处理', {
        description: '请稍后刷新查看最新状态',
      })
      queryClient.invalidateQueries({
        queryKey: listDocumentsQueryKey({ path: { id } }),
      })
    },
    onError: (error) => {
      toast.error('重试失败', { description: error.message || '请稍后重试' })
    },
  })

  const deleteDocument = useMutation({
    ...deleteDocumentMutation(),
    onSuccess: () => {
      setDeleteFailedDocId(null)
      toast.success('文档已删除')
      queryClient.invalidateQueries({
        queryKey: listDocumentsQueryKey({ path: { id } }),
      })
      queryClient.invalidateQueries({
        queryKey: getKbQueryKey({ path: { id } }),
      })
      queryClient.invalidateQueries({ queryKey: listKbsQueryKey() })
    },
    onError: (error, variables) => {
      setDeleteFailedDocId(variables.path.doc_id)
      toast.error('删除文档失败', {
        description: error.message || '请稍后重试',
      })
    },
  })

  const kb = kbQuery.data?.data
  const documents =
    (documentsQuery.data?.data as KnowledgeDocumentOut[] | null | undefined) ??
    []
  const showPollingHint = useDebouncedBoolean(
    documentsQuery.isFetching && documents.length > 0,
    300,
  )

  const openEditDialog = () => {
    if (!kb) {
      return
    }
    setEditName(kb.name)
    setEditDescription(kb.description || '')
    setEditPublic(Boolean(kb.isPublic))
    clearEditAvatarSelection(kb.avatar || '')
    setEditingOpen(true)
  }

  const handleUpdate = () => {
    if (!editName.trim()) {
      toast.error('请输入知识库名称')
      return
    }

    updateKb.mutate({
      path: { id },
      body: {
        name: editName.trim(),
        description: editDescription.trim() || null,
        isPublic: editPublic,
      },
    })
  }

  const handleUpload = (file?: File | null) => {
    if (!file) {
      return
    }
    uploadDocument.mutate({
      path: { id },
      body: { file },
    })
  }

  const handleDeleteDocument = (docId: string) => {
    setDeleteFailedDocId(null)
    deleteDocument.mutate({
      path: { id, doc_id: docId },
    })
  }

  const refreshQueue = () => {
    queryClient.invalidateQueries({
      queryKey: listDocumentsQueryKey({ path: { id } }),
    })
  }

  const handleEditAvatarChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      event.target.value = ''
      return
    }
    setEditAvatarFile(file)
    setEditAvatarPreviewUrl((previous) => {
      revokeObjectUrl(previous)
      return URL.createObjectURL(file)
    })
  }

  return (
    <AuthRequired
      title='知识库管理需要登录'
      description='请先登录后再管理知识库文档、上传文件和修改配置。'
    >
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8'>
        <section className='space-y-3'>
          <Link
            to='/knowledge-bases'
            className='inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground'
          >
            <ArrowLeft className='size-4' />
            返回知识库列表
          </Link>
        </section>

        {!kb && kbQuery.isPending && (
          <Card className='border-dashed py-10 text-center'>
            <CardContent>
              <p className='text-sm text-muted-foreground'>知识库加载中...</p>
            </CardContent>
          </Card>
        )}

        {!kb && !kbQuery.isPending && (
          <Card className='border-dashed py-10 text-center'>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                知识库不存在或无访问权限
              </p>
            </CardContent>
          </Card>
        )}

        {kb && (
          <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]'>
            <div className='space-y-6'>
              <Card className='gap-4 border bg-card py-5'>
                <CardHeader className='px-5'>
                  <div className='flex items-start gap-3'>
                    <Avatar className='mt-0.5 size-12 border border-border'>
                      <AvatarImage src={kb.avatar || ''} alt={kb.name} />
                      <AvatarFallback className='text-base'>
                        {getInitialChar(kb.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='min-w-0'>
                      <CardTitle className='text-base'>
                        知识库信息 · {kb.name}
                      </CardTitle>
                      <CardDescription>
                        {kb.description || '暂无描述'} · 更新时间：
                        {formatDateTime(kb.updatedAt)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4 px-5'>
                  <div className='flex items-center gap-2'>
                    <Avatar className='size-6'>
                      <AvatarImage
                        src={kb.authorAvatar || ''}
                        alt={kb.authorName || kb.authorId}
                      />
                      <AvatarFallback className='text-xs'>
                        {getInitialChar(kb.authorName || kb.authorId)}
                      </AvatarFallback>
                    </Avatar>
                    <p className='text-xs text-muted-foreground'>
                      作者：{kb.authorName || kb.authorId}
                    </p>
                  </div>
                  <div className='grid gap-3 sm:grid-cols-3'>
                    <div className='rounded-lg border bg-muted/20 p-3'>
                      <p className='text-xs text-muted-foreground'>文档总数</p>
                      <p className='mt-1 text-2xl font-semibold'>
                        {kb.documentCount}
                      </p>
                    </div>
                    <div className='rounded-lg border bg-muted/20 p-3'>
                      <p className='text-xs text-muted-foreground'>片段总数</p>
                      <p className='mt-1 text-2xl font-semibold'>
                        {kb.chunkCount}
                      </p>
                    </div>
                    <div className='rounded-lg border bg-muted/20 p-3'>
                      <p className='text-xs text-muted-foreground'>可见性</p>
                      <p className='mt-1 text-sm font-semibold'>
                        {kb.isPublic ? '公开知识库' : '私有知识库'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='gap-4 border bg-card py-5'>
                <CardHeader className='px-5'>
                  <CardTitle className='text-base'>文档处理队列</CardTitle>
                  <CardDescription>当前知识库 ID：{id}。</CardDescription>
                </CardHeader>
                <CardContent className='space-y-3 px-5'>
                  {showPollingHint && (
                    <p className='text-xs text-muted-foreground'>
                      文档状态刷新中...
                    </p>
                  )}
                  {documents.length === 0 ? (
                    <p className='text-sm text-muted-foreground'>
                      当前知识库暂无文档记录
                    </p>
                  ) : (
                    <div className='space-y-2'>
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className='rounded-md border bg-background p-3 text-sm'
                        >
                          <div className='flex flex-wrap items-center justify-between gap-2'>
                            <p className='font-medium'>{doc.fileName}</p>
                            <Badge
                              variant='outline'
                              className={getDocumentStatusBadgeClassName(
                                doc.status,
                              )}
                            >
                              {doc.status}
                            </Badge>
                          </div>
                          <p className='mt-1 text-xs text-muted-foreground'>
                            类型：{doc.fileType} / 大小：
                            {formatBytes(doc.fileSize)} / 片段：{doc.chunkCount}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            更新时间：{formatDateTime(doc.updatedAt)}
                          </p>
                          {doc.errorMessage && (
                            <p className='mt-1 text-xs text-destructive'>
                              失败原因：{doc.errorMessage}
                            </p>
                          )}
                          {isDocumentProcessing(
                            normalizeDocumentStatus(doc.status),
                          ) && (
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
                                onClick={() =>
                                  retryDocument.mutate({
                                    path: { id, doc_id: doc.id },
                                  })
                                }
                                disabled={retryDocument.isPending}
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
                                    deleteDocument.isPending ||
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
                                  <AlertDialogTitle>
                                    确认删除文档？
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    删除后文档索引会被移除：{doc.fileName}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction
                                    variant='destructive'
                                    onClick={() => handleDeleteDocument(doc.id)}
                                  >
                                    确认删除
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            {deleteFailedDocId === doc.id && (
                              <Button
                                type='button'
                                size='sm'
                                variant='outline'
                                onClick={() => handleDeleteDocument(doc.id)}
                                disabled={deleteDocument.isPending}
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
            </div>

            <ResponsiveActionPanel
              title='操作面板'
              description='常用管理操作集中在此。'
              renderActions={(closeMobilePanel) => (
                <>
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full justify-start'
                    onClick={() => {
                      openEditDialog()
                      closeMobilePanel()
                    }}
                  >
                    <PencilLine className='size-4' />
                    编辑知识库
                  </Button>
                  <label className='block'>
                    <input
                      type='file'
                      className='hidden'
                      onChange={(event) => {
                        handleUpload(event.target.files?.[0])
                        event.currentTarget.value = ''
                        closeMobilePanel()
                      }}
                    />
                    <Button
                      type='button'
                      variant='outline'
                      className='w-full justify-start'
                      asChild
                    >
                      <span>
                        <FileUp className='size-4' />
                        上传文档
                      </span>
                    </Button>
                  </label>
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full justify-start'
                    onClick={() => {
                      refreshQueue()
                      closeMobilePanel()
                    }}
                  >
                    <RefreshCcw className='size-4' />
                    刷新队列
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type='button'
                        variant='destructive'
                        className='w-full justify-start'
                        disabled={deleteKb.isPending}
                        onClick={closeMobilePanel}
                      >
                        <Trash2 className='size-4' />
                        删除知识库
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent size='sm'>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认删除知识库？</AlertDialogTitle>
                        <AlertDialogDescription>
                          删除后将无法恢复知识库及其文档索引：{kb.name}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                          variant='destructive'
                          onClick={() =>
                            deleteKb.mutate({
                              path: { id },
                            })
                          }
                        >
                          确认删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            />
          </div>
        )}

        <Dialog
          open={editingOpen}
          onOpenChange={(open) => {
            setEditingOpen(open)
            if (!open) {
              clearEditAvatarSelection(kb?.avatar || '')
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑知识库</DialogTitle>
              <DialogDescription>
                修改名称、描述和可见性设置，保存后立即生效。
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-3'>
              <div className='flex items-center gap-4'>
                <button
                  type='button'
                  className='group relative'
                  onClick={() => editAvatarInputRef.current?.click()}
                  aria-label='选择知识库头像'
                >
                  <Avatar className='size-16 border border-border'>
                    <AvatarImage
                      src={editAvatarPreviewUrl}
                      alt='知识库头像预览'
                    />
                    <AvatarFallback className='text-base'>
                      {getInitialChar(editName || kb?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 opacity-0 transition-opacity group-hover:opacity-100'>
                    <Camera className='size-4 text-background' />
                  </div>
                </button>
                <div className='min-w-0 flex-1 space-y-1'>
                  <p className='text-sm font-medium'>知识库头像</p>
                  <p className='truncate text-xs text-muted-foreground'>
                    {editAvatarFile
                      ? editAvatarFile.name
                      : '点击头像选择本地图片'}
                  </p>
                </div>
                {editAvatarFile && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => clearEditAvatarSelection(kb?.avatar || '')}
                  >
                    清除
                  </Button>
                )}
                <input
                  ref={editAvatarInputRef}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={handleEditAvatarChange}
                />
              </div>
              <Input
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                placeholder='知识库名称'
              />
              <Textarea
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                placeholder='知识库描述'
              />
              <div className='flex items-center justify-between rounded-md border p-3'>
                <p className='text-sm text-muted-foreground'>可见性</p>
                <PublicToggle
                  checked={editPublic}
                  onCheckedChange={setEditPublic}
                  publicLabel='公开知识库'
                  privateLabel='私有知识库'
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant='ghost' onClick={() => setEditingOpen(false)}>
                取消
              </Button>
              <Button onClick={handleUpdate} disabled={updateKb.isPending}>
                {updateKb.isPending ? '保存中...' : '保存修改'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthRequired>
  )
}
