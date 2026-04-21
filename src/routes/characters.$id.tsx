import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Camera, Heart, PencilLine, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  cancelFavoriteCharacterMutation,
  deleteCharacterMutation,
  favoriteCharacterMutation,
  getCharactersQueryKey,
  getPrivateCharacterOptions,
  getPrivateCharacterQueryKey,
  updateCharacterMutation,
  uploadCharacterAvatarMutation,
} from '#/client/@tanstack/react-query.gen'
import type { ApiResponseCharacterDetailOut } from '#/client/types.gen'
import { AuthRequired } from '#/components/shared/auth-required'
import { PublicToggle } from '#/components/shared/public-toggle'
import { ResponsiveActionPanel } from '#/components/shared/responsive-action-panel'
import { TagInput } from '#/components/shared/tag-input'
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

export const Route = createFileRoute('/characters/$id')({
  component: CharacterDetailPage,
})

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

function revokeObjectUrl(url: string) {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

function getInitialChar(value?: string | null) {
  const text = value?.trim()
  return text ? text.slice(0, 1).toUpperCase() : 'C'
}

function CharacterDetailPage() {
  const { id } = Route.useParams()
  const auth = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const editAvatarInputRef = useRef<HTMLInputElement | null>(null)

  const [editingOpen, setEditingOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editSystemPrompt, setEditSystemPrompt] = useState('')
  const [editBaseConfig, setEditBaseConfig] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])
  const [editPublic, setEditPublic] = useState(true)
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null)
  const [editAvatarPreviewUrl, setEditAvatarPreviewUrl] = useState('')

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

  const characterQuery = useQuery({
    ...getPrivateCharacterOptions({
      path: { id },
    }),
    enabled: Boolean(auth.accessToken),
  })

  const updateCharacter = useMutation({
    ...updateCharacterMutation(),
    onSuccess: async () => {
      if (editAvatarFile) {
        try {
          await uploadCharacterAvatar.mutateAsync({
            path: { id },
            body: { file: editAvatarFile },
          })
          toast.success('角色头像已上传')
        } catch (error) {
          toast.warning('角色资料已保存，但头像上传失败', {
            description:
              error instanceof Error ? error.message : '请稍后重试上传头像',
          })
        }
      }
      toast.success('角色已更新')
      setEditingOpen(false)
      clearEditAvatarSelection()
      queryClient.invalidateQueries({
        queryKey: getPrivateCharacterQueryKey({ path: { id } }),
      })
      queryClient.invalidateQueries({ queryKey: getCharactersQueryKey() })
    },
    onError: (error) => {
      toast.error('更新失败', { description: error.message || '请稍后重试' })
    },
  })
  const uploadCharacterAvatar = useMutation({
    ...uploadCharacterAvatarMutation(),
  })

  const deleteCharacter = useMutation({
    ...deleteCharacterMutation(),
    onSuccess: async () => {
      toast.success('角色已删除')
      await queryClient.invalidateQueries({ queryKey: getCharactersQueryKey() })
      void navigate({ to: '/characters' })
    },
    onError: (error) => {
      toast.error('删除失败', { description: error.message || '请稍后重试' })
    },
  })

  const favoriteCharacter = useMutation({
    ...favoriteCharacterMutation(),
    onSuccess: () => {
      toast.success('收藏成功')
      queryClient.setQueryData(
        getPrivateCharacterQueryKey({ path: { id } }),
        (previous: ApiResponseCharacterDetailOut | undefined) => {
          const detail = previous?.data
          if (!detail) return previous
          return {
            ...previous,
            data: {
              ...detail,
              isFavorited: true,
              favoriteCount: (detail.favoriteCount ?? 0) + 1,
            },
          }
        },
      )
      queryClient.invalidateQueries({ queryKey: getCharactersQueryKey() })
    },
    onError: (error) => {
      toast.error('收藏失败', { description: error.message || '请稍后重试' })
    },
  })

  const cancelFavorite = useMutation({
    ...cancelFavoriteCharacterMutation(),
    onSuccess: () => {
      toast.success('已取消收藏')
      queryClient.setQueryData(
        getPrivateCharacterQueryKey({ path: { id } }),
        (previous: ApiResponseCharacterDetailOut | undefined) => {
          const detail = previous?.data
          if (!detail) return previous
          return {
            ...previous,
            data: {
              ...detail,
              isFavorited: false,
              favoriteCount: Math.max((detail.favoriteCount ?? 1) - 1, 0),
            },
          }
        },
      )
      queryClient.invalidateQueries({ queryKey: getCharactersQueryKey() })
    },
    onError: (error) => {
      toast.error('取消收藏失败', {
        description: error.message || '请稍后重试',
      })
    },
  })

  const character = characterQuery.data?.data

  const openEditDialog = () => {
    if (!character) {
      return
    }
    setEditName(character.name)
    setEditBio(character.bio || '')
    setEditSystemPrompt(character.systemPrompt || '')
    setEditBaseConfig(
      character.baseConfig ? JSON.stringify(character.baseConfig, null, 2) : '',
    )
    setEditTags(character.tags ?? [])
    setEditPublic(Boolean(character.isPublic))
    clearEditAvatarSelection(character.avatar || '')
    setEditingOpen(true)
  }

  const handleUpdate = () => {
    if (!editName.trim()) {
      toast.error('请输入角色名称')
      return
    }

    const baseConfig = parseBaseConfigFromText(editBaseConfig)
    if (baseConfig === null) {
      toast.error('baseConfig 必须是合法 JSON 对象')
      return
    }

    updateCharacter.mutate({
      path: { id },
      body: {
        name: editName.trim(),
        bio: editBio.trim() || '',
        systemPrompt: editSystemPrompt.trim() || '',
        baseConfig: baseConfig ?? null,
        tags: editTags,
        isPublic: editPublic,
      },
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
      title='角色管理需要登录'
      description='请先登录后再管理角色设定、收藏状态和可见性。'
    >
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8'>
        <section className='space-y-3'>
          <Link
            to='/characters'
            className='inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground'
          >
            <ArrowLeft className='size-4' />
            返回角色列表
          </Link>
          <h1 className='font-serif text-3xl font-bold tracking-tight'>
            {character?.name || '角色管理'}
          </h1>
          <p className='max-w-3xl text-sm text-muted-foreground'>
            在此页面集中完成角色配置、标签维护和收藏管理。
          </p>
        </section>

        {!character && characterQuery.isPending && (
          <Card className='border-dashed py-10 text-center'>
            <CardContent>
              <p className='text-sm text-muted-foreground'>角色加载中...</p>
            </CardContent>
          </Card>
        )}

        {!character && !characterQuery.isPending && (
          <Card className='border-dashed py-10 text-center'>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                角色不存在或无访问权限
              </p>
            </CardContent>
          </Card>
        )}

        {character && (
          <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]'>
            <div className='space-y-6'>
              <Card className='gap-4 border bg-card py-5'>
                <CardHeader className='px-5'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex items-start gap-3'>
                      <Avatar className='mt-0.5 size-12 border border-border'>
                        <AvatarImage
                          src={character.avatar || ''}
                          alt={character.name}
                        />
                        <AvatarFallback className='text-base'>
                          {getInitialChar(character.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className='text-base'>
                          {character.name}
                        </CardTitle>
                        <CardDescription>
                          {character.bio || '暂无角色简介'}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={character.isPublic ? 'secondary' : 'outline'}
                    >
                      {character.isPublic ? '公开' : '私有'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4 px-5'>
                  <div className='flex items-center gap-2'>
                    <Avatar className='size-6'>
                      <AvatarImage
                        src={character.authorAvatar || ''}
                        alt={character.authorName || character.authorId}
                      />
                      <AvatarFallback className='text-xs'>
                        {getInitialChar(
                          character.authorName || character.authorId,
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <p className='text-xs text-muted-foreground'>
                      作者：{character.authorName || character.authorId}
                    </p>
                  </div>
                  <div className='grid gap-3 sm:grid-cols-3'>
                    <div className='rounded-lg border bg-muted/20 p-3'>
                      <p className='text-xs text-muted-foreground'>收藏总数</p>
                      <p className='mt-1 text-2xl font-semibold'>
                        {character.favoriteCount}
                      </p>
                    </div>
                    <div className='rounded-lg border bg-muted/20 p-3'>
                      <p className='text-xs text-muted-foreground'>对话总数</p>
                      <p className='mt-1 text-2xl font-semibold'>
                        {character.chatCount}
                      </p>
                    </div>
                    <div className='rounded-lg border bg-muted/20 p-3'>
                      <p className='text-xs text-muted-foreground'>状态</p>
                      <p className='mt-1 text-sm font-semibold'>
                        {character.status || 'unknown'}
                      </p>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <p className='text-xs text-muted-foreground'>
                      创建于 {formatDateTime(character.createdAt)} · 更新于{' '}
                      {formatDateTime(character.updatedAt)}
                    </p>
                    {character.tags && character.tags.length > 0 ? (
                      <div className='flex flex-wrap gap-2'>
                        {character.tags.map((tag) => (
                          <Badge key={tag} variant='outline'>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className='text-xs text-muted-foreground'>
                        未设置标签
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <ResponsiveActionPanel
              title='操作面板'
              description='常用角色管理操作集中在此。'
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
                    编辑角色
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full justify-start'
                    disabled={
                      favoriteCharacter.isPending || cancelFavorite.isPending
                    }
                    onClick={() => {
                      const action = character.isFavorited
                        ? cancelFavorite
                        : favoriteCharacter
                      action.mutate({
                        path: { id: character.id },
                      })
                      closeMobilePanel()
                    }}
                  >
                    <Heart
                      className={`size-4 ${character.isFavorited ? 'fill-current text-red-500' : ''}`}
                    />
                    {character.isFavorited ? '取消收藏' : '收藏角色'}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type='button'
                        variant='destructive'
                        className='w-full justify-start'
                        disabled={deleteCharacter.isPending}
                        onClick={closeMobilePanel}
                      >
                        <Trash2 className='size-4' />
                        删除角色
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent size='sm'>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认删除角色？</AlertDialogTitle>
                        <AlertDialogDescription>
                          删除后将无法恢复角色设定及其关联会话：{character.name}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                          variant='destructive'
                          onClick={() =>
                            deleteCharacter.mutate({
                              path: { id: character.id },
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
              clearEditAvatarSelection(character?.avatar || '')
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑角色</DialogTitle>
              <DialogDescription>
                修改角色名称、简介、标签和可见性，保存后立即生效。
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-3'>
              <div className='flex items-center gap-4'>
                <button
                  type='button'
                  className='group relative'
                  onClick={() => editAvatarInputRef.current?.click()}
                  aria-label='选择角色头像'
                >
                  <Avatar className='size-16 border border-border'>
                    <AvatarImage
                      src={editAvatarPreviewUrl}
                      alt='角色头像预览'
                    />
                    <AvatarFallback className='text-base'>
                      {getInitialChar(editName || character?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 transition-opacity group-hover:opacity-100'>
                    <Camera className='size-4 text-white' />
                  </div>
                </button>
                <div className='min-w-0 flex-1 space-y-1'>
                  <p className='text-sm font-medium'>角色头像</p>
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
                    onClick={() =>
                      clearEditAvatarSelection(character?.avatar || '')
                    }
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
                placeholder='角色名称'
              />
              <Textarea
                value={editBio}
                onChange={(event) => setEditBio(event.target.value)}
                placeholder='角色简介'
              />
              <Textarea
                value={editSystemPrompt}
                onChange={(event) => setEditSystemPrompt(event.target.value)}
                placeholder='系统提示词（systemPrompt，可选）'
              />
              <Textarea
                value={editBaseConfig}
                onChange={(event) => setEditBaseConfig(event.target.value)}
                placeholder='LLM 参数 JSON（baseConfig，可选）'
                className='font-mono text-xs'
              />
              <TagInput
                value={editTags}
                onChange={setEditTags}
                placeholder='添加角色标签，按回车确认'
              />
              <div className='flex items-center justify-between rounded-md border p-3'>
                <p className='text-sm text-muted-foreground'>可见性</p>
                <PublicToggle
                  checked={editPublic}
                  onCheckedChange={setEditPublic}
                  publicLabel='公开角色'
                  privateLabel='私有角色'
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant='ghost' onClick={() => setEditingOpen(false)}>
                取消
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updateCharacter.isPending}
              >
                {updateCharacter.isPending ? '保存中...' : '保存修改'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthRequired>
  )
}
