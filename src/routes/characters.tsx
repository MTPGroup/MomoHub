import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'
import { Camera, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  createCharacterMutation,
  getCharactersOptions,
  getCharactersQueryKey,
  uploadCharacterAvatarMutation,
} from '#/client/@tanstack/react-query.gen'
import { AuthForm } from '#/components/features/auth/auth-form'
import { PublicToggle } from '#/components/shared/public-toggle'
import { ResourceListLayout } from '#/components/shared/resource-list-layout'
import { ResourceSummaryCard } from '#/components/shared/resource-summary-card'
import { TagInput } from '#/components/shared/tag-input'
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

export const Route = createFileRoute('/characters')({
  component: CharactersPage,
})

function getInitialChar(value?: string | null) {
  const text = value?.trim()
  return text ? text.slice(0, 1).toUpperCase() : 'C'
}

function getCharacterStatusBadgeClassName(status?: string) {
  const normalized = status?.toLowerCase() ?? ''
  if (normalized.includes('active')) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (normalized.includes('pending')) {
    return 'border-blue-200 bg-blue-50 text-blue-700'
  }
  if (
    normalized.includes('banned') ||
    normalized.includes('deleted') ||
    normalized.includes('draft')
  ) {
    return 'border-red-200 bg-red-50 text-red-700'
  }
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

function revokeObjectUrl(url: string) {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

function parseBaseConfigFromText(raw: string) {
  const text = raw.trim()
  if (!text) {
    return undefined
  }
  try {
    const parsed = JSON.parse(text)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null
    }
    return parsed as Record<string, unknown>
  } catch {
    return null
  }
}

export function CharactersPage({ mineOnly = false }: { mineOnly?: boolean }) {
  const auth = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createAvatarInputRef = useRef<HTMLInputElement | null>(null)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const listPath = mineOnly ? '/my/characters' : '/characters'
  const isListPage = pathname === listPath

  const [searchValue, setSearchValue] = useState('')
  const [createName, setCreateName] = useState('')
  const [createBio, setCreateBio] = useState('')
  const [createSystemPrompt, setCreateSystemPrompt] = useState('')
  const [createBaseConfig, setCreateBaseConfig] = useState('')
  const [createTags, setCreateTags] = useState<string[]>([])
  const [createPublic, setCreatePublic] = useState(true)
  const [createAvatarFile, setCreateAvatarFile] = useState<File | null>(null)
  const [createAvatarPreviewUrl, setCreateAvatarPreviewUrl] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const clearCreateAvatarSelection = () => {
    setCreateAvatarFile(null)
    setCreateAvatarPreviewUrl((previous) => {
      revokeObjectUrl(previous)
      return ''
    })
    if (createAvatarInputRef.current) {
      createAvatarInputRef.current.value = ''
    }
  }

  useEffect(() => {
    return () => {
      revokeObjectUrl(createAvatarPreviewUrl)
    }
  }, [createAvatarPreviewUrl])

  const characterQuery = useQuery({
    ...getCharactersOptions({
      headers: auth.accessToken
        ? {
            Authorization: `Bearer ${auth.accessToken}`,
          }
        : undefined,
      query: {
        page: 1,
        page_size: 30,
        keyword: searchValue.trim() || undefined,
        mine: mineOnly,
      },
    }),
    enabled: isListPage,
  })

  const createCharacter = useMutation({
    ...createCharacterMutation(),
    onSuccess: async (res) => {
      const newCharacterId = res.data?.id
      if (newCharacterId && createAvatarFile) {
        try {
          await uploadCharacterAvatar.mutateAsync({
            path: { id: newCharacterId },
            body: { file: createAvatarFile },
          })
          toast.success('角色头像已上传')
        } catch (error) {
          toast.warning('角色已创建，但头像上传失败', {
            description:
              error instanceof Error
                ? error.message
                : '请稍后在角色管理页重试上传头像',
          })
        }
      }

      toast.success('角色已创建')
      setCreateName('')
      setCreateBio('')
      setCreateSystemPrompt('')
      setCreateBaseConfig('')
      setCreateTags([])
      setCreatePublic(true)
      clearCreateAvatarSelection()
      setCreateDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: getCharactersQueryKey() })
      if (newCharacterId) {
        void navigate({ to: '/characters/$id', params: { id: newCharacterId } })
      }
    },
    onError: (error) => {
      toast.error('创建失败', { description: error.message || '请稍后重试' })
    },
  })
  const uploadCharacterAvatar = useMutation({
    ...uploadCharacterAvatarMutation(),
  })

  const characters = characterQuery.data?.data?.items ?? []

  const handleCreate = () => {
    if (!createName.trim()) {
      toast.error('请输入角色名称')
      return
    }

    const baseConfig = parseBaseConfigFromText(createBaseConfig)
    if (baseConfig === null) {
      toast.error('baseConfig 必须是合法 JSON 对象')
      return
    }

    createCharacter.mutate({
      body: {
        name: createName.trim(),
        bio: createBio.trim() || null,
        systemPrompt: createSystemPrompt.trim() || undefined,
        baseConfig,
        tags: createTags,
        isPublic: createPublic,
        status: 'active',
      },
    })
  }

  const openCharacterDetail = (id: string) => {
    void navigate({ to: '/characters/$id', params: { id } })
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
      revokeObjectUrl(previous)
      return URL.createObjectURL(file)
    })
  }

  if (!isListPage) {
    return <Outlet />
  }

  return (
    <ResourceListLayout
      title={mineOnly ? '我的AI角色' : 'AI角色管理与探索'}
      description={
        mineOnly
          ? '仅展示你创建的角色，便于集中管理与维护。'
          : '发现和探索社区创建的 AI 角色'
      }
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder='输入关键词过滤角色'
      createTitle='新建角色'
      createDescription={`建议在简介中包含场景与边界，后续进入子页面管理角色配置。${
        !auth.accessToken ? ' 当前为浏览模式，登录后可创建与管理。' : ''
      }`}
      createAction={
        auth.accessToken ? (
          <Button type='button' onClick={() => setCreateDialogOpen(true)}>
            <Plus className='size-4' />
            新建角色
          </Button>
        ) : (
          <AuthForm>
            <Button type='button' variant='outline'>
              登录后新建
            </Button>
          </AuthForm>
        )
      }
      footer={
        characters.length === 0 ? (
          <Card className='gap-2 border-dashed py-10 text-center'>
            <CardContent>
              <p className='text-sm text-muted-foreground'>没有匹配的角色</p>
            </CardContent>
          </Card>
        ) : null
      }
    >
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
            <DialogTitle>新建角色</DialogTitle>
            <DialogDescription>
              填写角色设定与标签，并设置公开性，创建后会自动跳转到管理页。
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-3'>
            <div className='flex items-center gap-4'>
              <button
                type='button'
                className='group relative'
                onClick={() => createAvatarInputRef.current?.click()}
                aria-label='选择角色头像'
              >
                <Avatar className='size-16 border border-border/80'>
                  <AvatarImage
                    src={createAvatarPreviewUrl}
                    alt='角色头像预览'
                  />
                  <AvatarFallback className='text-base'>
                    {getInitialChar(createName)}
                  </AvatarFallback>
                </Avatar>
                <div className='absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 opacity-0 transition-opacity group-hover:opacity-100'>
                  <Camera className='size-4 text-background' />
                </div>
              </button>
              <div className='min-w-0 flex-1 space-y-1'>
                <p className='text-sm font-medium'>角色头像</p>
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
                ref={createAvatarInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleCreateAvatarChange}
              />
            </div>
            <Input
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              placeholder='角色名称'
            />
            <Input
              value={createBio}
              onChange={(event) => setCreateBio(event.target.value)}
              placeholder='角色简介（可选）'
            />
            <Textarea
              value={createSystemPrompt}
              onChange={(event) => setCreateSystemPrompt(event.target.value)}
              placeholder='系统提示词（可选）'
            />
            <Textarea
              value={createBaseConfig}
              onChange={(event) => setCreateBaseConfig(event.target.value)}
              placeholder={`// 角色配置JSON（可选）
{
  "temperature": 0.7,
  "top_p": 1,
  "max_tokens": 2000,
  "presence_penalty": 0,
  "frequency_penalty": 0
}`}
              className='font-mono text-xs'
            />
            <TagInput
              value={createTags}
              onChange={setCreateTags}
              placeholder='添加角色标签，按回车确认'
            />
            <div className='flex items-center justify-between rounded-md border p-3'>
              <p className='text-sm text-muted-foreground'>可见性</p>
              <PublicToggle
                checked={createPublic}
                onCheckedChange={setCreatePublic}
                publicLabel='公开角色'
                privateLabel='私有角色'
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={createCharacter.isPending}>
              {createCharacter.isPending ? '创建中...' : '创建角色'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {characters.map((item) => (
          <ResourceSummaryCard
            key={item.id}
            onClick={() => openCharacterDetail(item.id)}
            title={item.name}
            description={item.bio || '暂无角色简介'}
            avatarSrc={item.avatar || ''}
            avatarFallback={getInitialChar(item.name)}
            statusText={item.status || 'unknown'}
            statusClassName={getCharacterStatusBadgeClassName(item.status)}
            visibilityText={item.isPublic ? '公开' : '私有'}
            visibilityVariant={item.isPublic ? 'secondary' : 'outline'}
            authorName={item.authorName || item.authorId}
            authorAvatarSrc={item.authorAvatar || ''}
            authorAvatarFallback={getInitialChar(
              item.authorName || item.authorId,
            )}
            metaText={`创建于 ${formatDateTime(item.createdAt)}`}
          />
        ))}
      </section>
    </ResourceListLayout>
  )
}
