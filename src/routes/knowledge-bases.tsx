import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'
import { Camera, Plus, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  createKbMutation,
  listKbsOptions,
  listKbsQueryKey,
  uploadKbAvatarMutation,
} from '#/client/@tanstack/react-query.gen'
import { AuthForm } from '#/components/features/auth/auth-form'
import { PublicToggle } from '#/components/shared/public-toggle'
import { ResourceSummaryCard } from '#/components/shared/resource-summary-card'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
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

export const Route = createFileRoute('/knowledge-bases')({
  component: KnowledgeBasesPage,
})

function getKbStatusBadgeClassName(status?: string | null) {
  const normalized = status?.toLowerCase() ?? ''
  if (
    normalized.includes('ready') ||
    normalized.includes('active') ||
    normalized.includes('ok')
  ) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (
    normalized.includes('error') ||
    normalized.includes('fail') ||
    normalized.includes('rejected')
  ) {
    return 'border-red-200 bg-red-50 text-red-700'
  }
  if (
    normalized.includes('building') ||
    normalized.includes('processing') ||
    normalized.includes('pending')
  ) {
    return 'border-blue-200 bg-blue-50 text-blue-700'
  }
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

function getInitialChar(value?: string | null) {
  const text = value?.trim()
  return text ? text.slice(0, 1).toUpperCase() : 'K'
}

function KnowledgeBasesPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isListPage = pathname === '/knowledge-bases'

  const [searchValue, setSearchValue] = useState('')

  const [createName, setCreateName] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [createPublic, setCreatePublic] = useState(false)
  const [createAvatarFile, setCreateAvatarFile] = useState<File | null>(null)
  const [createAvatarPreviewUrl, setCreateAvatarPreviewUrl] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const clearCreateAvatarSelection = () => {
    setCreateAvatarFile(null)
    setCreateAvatarPreviewUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous)
      }
      return ''
    })
    if (avatarInputRef.current) {
      avatarInputRef.current.value = ''
    }
  }

  useEffect(() => {
    return () => {
      if (createAvatarPreviewUrl) {
        URL.revokeObjectURL(createAvatarPreviewUrl)
      }
    }
  }, [createAvatarPreviewUrl])

  const kbQuery = useQuery({
    ...listKbsOptions({
      query: {
        page: 1,
        page_size: 30,
        keyword: searchValue.trim() || undefined,
      },
    }),
    enabled: Boolean(auth.accessToken && isListPage),
  })

  const uploadKbAvatar = useMutation({
    ...uploadKbAvatarMutation(),
  })

  const createKb = useMutation({
    ...createKbMutation(),
    onSuccess: async (res) => {
      const newKbId = res.data?.id
      if (newKbId && createAvatarFile) {
        try {
          await uploadKbAvatar.mutateAsync({
            path: { id: newKbId },
            body: { file: createAvatarFile },
          })
          toast.success('知识库头像已上传')
        } catch (error) {
          toast.warning('知识库已创建，但头像上传失败', {
            description:
              error instanceof Error
                ? error.message
                : '请稍后在管理页重试上传头像',
          })
        }
      }

      toast.success('知识库已创建')
      setCreateName('')
      setCreateDescription('')
      setCreatePublic(false)
      clearCreateAvatarSelection()
      setCreateDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: listKbsQueryKey() })
      if (newKbId) {
        void navigate({ to: '/knowledge-bases/$id', params: { id: newKbId } })
      }
    },
    onError: (error) => {
      toast.error('创建失败', { description: error.message || '请稍后重试' })
    },
  })

  const allItems = kbQuery.data?.data?.items ?? []
  const privateCount = allItems.filter((item) => !item.isPublic).length

  const handleCreate = () => {
    if (!createName.trim()) {
      toast.error('请输入知识库名称')
      return
    }

    createKb.mutate({
      body: {
        name: createName.trim(),
        description: createDescription.trim() || null,
        isPublic: createPublic,
      },
    })
  }

  const openKbDetail = (id: string) => {
    void navigate({ to: '/knowledge-bases/$id', params: { id } })
  }

  const handleCreateAvatarChange = (
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

    setCreateAvatarFile(file)
    setCreateAvatarPreviewUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous)
      }
      return URL.createObjectURL(file)
    })
  }

  if (!isListPage) {
    return <Outlet />
  }

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8'>
      <section className='space-y-3'>
        <h1 className='font-serif text-3xl font-bold tracking-tight'>
          知识库管理与探索
        </h1>
        <p className='max-w-3xl text-sm leading-6 text-muted-foreground'>
          探索和管理知识库资源
        </p>
      </section>

      <section className='relative'>
        <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder='输入关键词过滤知识库'
          className='pl-10'
        />
      </section>

      <section className='flex items-center justify-between rounded-xl border bg-card p-5'>
        <div className='space-y-1'>
          <p className='text-sm font-medium'>新建知识库</p>
          <p className='text-xs text-muted-foreground'>
            建议按拆分知识库，后续进入子页面管理文档队列。
            {!auth.accessToken ? ' 当前为浏览模式，登录后可创建与管理。' : ''}
          </p>
        </div>
        {auth.accessToken ? (
          <Button type='button' onClick={() => setCreateDialogOpen(true)}>
            <Plus className='size-4' />
            新建知识库
          </Button>
        ) : (
          <AuthForm>
            <Button type='button' variant='outline'>
              登录后新建
            </Button>
          </AuthForm>
        )}
      </section>

      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open)
          if (!open) {
            clearCreateAvatarSelection()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建知识库</DialogTitle>
            <DialogDescription>
              填写基本信息并设置公开性，创建后会自动跳转到管理页。
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-3'>
            <div className='flex items-center gap-4'>
              <button
                type='button'
                className='group relative'
                onClick={() => avatarInputRef.current?.click()}
                aria-label='选择知识库头像'
              >
                <Avatar className='size-16 border border-border'>
                  <AvatarImage
                    src={createAvatarPreviewUrl}
                    alt='知识库头像预览'
                  />
                  <AvatarFallback className='text-base'>
                    {getInitialChar(createName)}
                  </AvatarFallback>
                </Avatar>
                <div className='absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 transition-opacity group-hover:opacity-100'>
                  <Camera className='size-4 text-white' />
                </div>
              </button>
              <div className='min-w-0 flex-1 space-y-1'>
                <p className='text-sm font-medium'>知识库头像</p>
                <p className='truncate text-xs text-muted-foreground'>
                  {createAvatarFile
                    ? createAvatarFile.name
                    : '点击头像选择本地图片'}
                </p>
              </div>
              {createAvatarFile && (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={clearCreateAvatarSelection}
                >
                  清除
                </Button>
              )}
              <input
                ref={avatarInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleCreateAvatarChange}
              />
            </div>
            <Input
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              placeholder='知识库名称'
            />
            <Textarea
              value={createDescription}
              onChange={(event) => setCreateDescription(event.target.value)}
              placeholder='知识库描述（可选）'
            />
            <div className='flex items-center justify-between rounded-md border p-3'>
              <p className='text-sm text-muted-foreground'>可见性</p>
              <PublicToggle
                checked={createPublic}
                onCheckedChange={setCreatePublic}
                publicLabel='公开知识库'
                privateLabel='私有知识库'
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              onClick={handleCreate}
              disabled={createKb.isPending}
            >
              {createKb.isPending ? '创建中...' : '创建知识库'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {allItems.map((item) => (
          <ResourceSummaryCard
            key={item.id}
            onClick={() => openKbDetail(item.id)}
            title={item.name}
            description={item.description || '暂无描述'}
            avatarSrc={item.avatar || ''}
            avatarFallback={getInitialChar(item.name)}
            statusText={item.status}
            statusClassName={getKbStatusBadgeClassName(item.status)}
            visibilityText={item.isPublic ? '公开' : '私有'}
            visibilityVariant={item.isPublic ? 'secondary' : 'outline'}
            authorName={item.authorName || item.authorId}
            authorAvatarSrc={item.authorAvatar || ''}
            authorAvatarFallback={getInitialChar(
              item.authorName || item.authorId,
            )}
            metaText={`更新于 ${formatDateTime(item.updatedAt)}`}
          />
        ))}
      </section>

      {allItems.length === 0 && (
        <Card className='gap-2 border-dashed py-10 text-center'>
          <CardContent>
            <p className='text-sm text-muted-foreground'>没有匹配的知识库</p>
          </CardContent>
        </Card>
      )}

      {privateCount > 0 && (
        <p className='text-xs text-muted-foreground'>
          已检索到 {allItems.length} 个知识库，其中 {privateCount}{' '}
          个为私有知识库。
        </p>
      )}
    </div>
  )
}
