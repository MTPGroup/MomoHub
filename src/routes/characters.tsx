import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Heart, PencilLine, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  cancelFavoriteCharacterMutation,
  createCharacterMutation,
  deleteCharacterMutation,
  favoriteCharacterMutation,
  getCharactersOptions,
  getCharactersQueryKey,
  getFavoriteCharactersOptions,
  getFavoriteCharactersQueryKey,
  updateCharacterMutation,
} from '#/client/@tanstack/react-query.gen'
import type { CharacterListItemOut } from '#/client/types.gen'
import { AuthForm } from '#/components/features/auth/auth-form'
import { PublicToggle } from '#/components/shared/public-toggle'
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

function CharactersPage() {
  const auth = useAuth()
  const queryClient = useQueryClient()

  const [keyword, setKeyword] = useState('')
  const [searchValue, setSearchValue] = useState('')

  const [createName, setCreateName] = useState('')
  const [createBio, setCreateBio] = useState('')
  const [createTags, setCreateTags] = useState('')
  const [createPublic, setCreatePublic] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const [editingItem, setEditingItem] = useState<CharacterListItemOut | null>(
    null,
  )
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editPublic, setEditPublic] = useState(true)

  const characterQuery = useQuery(
    getCharactersOptions({
      query: { page: 1, page_size: 30, keyword: keyword || undefined },
    }),
  )

  const favoriteQuery = useQuery({
    ...getFavoriteCharactersOptions({
      query: { page: 1, page_size: 30 },
    }),
    enabled: Boolean(auth.accessToken),
  })

  const createCharacter = useMutation({
    ...createCharacterMutation(),
    onSuccess: () => {
      toast.success('角色已创建')
      setCreateName('')
      setCreateBio('')
      setCreateTags('')
      setCreatePublic(true)
      setCreateDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: getCharactersQueryKey() })
    },
    onError: (error) => {
      toast.error('创建失败', { description: error.message || '请稍后重试' })
    },
  })

  const updateCharacter = useMutation({
    ...updateCharacterMutation(),
    onSuccess: () => {
      toast.success('角色已更新')
      setEditingItem(null)
      queryClient.invalidateQueries({ queryKey: getCharactersQueryKey() })
      queryClient.invalidateQueries({
        queryKey: getFavoriteCharactersQueryKey(),
      })
    },
    onError: (error) => {
      toast.error('更新失败', { description: error.message || '请稍后重试' })
    },
  })

  const deleteCharacter = useMutation({
    ...deleteCharacterMutation(),
    onSuccess: () => {
      toast.success('角色已删除')
      queryClient.invalidateQueries({ queryKey: getCharactersQueryKey() })
      queryClient.invalidateQueries({
        queryKey: getFavoriteCharactersQueryKey(),
      })
    },
    onError: (error) => {
      toast.error('删除失败', { description: error.message || '请稍后重试' })
    },
  })

  const favoriteCharacter = useMutation({
    ...favoriteCharacterMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getCharactersQueryKey() })
      queryClient.invalidateQueries({
        queryKey: getFavoriteCharactersQueryKey(),
      })
    },
    onError: (error) => {
      toast.error('收藏失败', { description: error.message || '请稍后重试' })
    },
  })

  const cancelFavorite = useMutation({
    ...cancelFavoriteCharacterMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getCharactersQueryKey() })
      queryClient.invalidateQueries({
        queryKey: getFavoriteCharactersQueryKey(),
      })
    },
    onError: (error) => {
      toast.error('取消收藏失败', {
        description: error.message || '请稍后重试',
      })
    },
  })

  const characters = characterQuery.data?.data?.items ?? []
  const favorites = favoriteQuery.data?.data?.items ?? []

  const handleCreate = () => {
    if (!createName.trim()) {
      toast.error('请输入角色名称')
      return
    }

    createCharacter.mutate({
      body: {
        name: createName.trim(),
        bio: createBio.trim() || null,
        tags: parseTags(createTags),
        isPublic: createPublic,
        status: 'active',
      },
    })
  }

  const openEdit = (item: CharacterListItemOut) => {
    setEditingItem(item)
    setEditName(item.name)
    setEditBio(item.bio || '')
    setEditTags(item.tags?.join(', ') || '')
    setEditPublic(Boolean(item.isPublic))
  }

  const handleUpdate = () => {
    if (!editingItem) {
      return
    }

    if (!editName.trim()) {
      toast.error('请输入角色名称')
      return
    }

    updateCharacter.mutate({
      path: { id: editingItem.id },
      body: {
        name: editName.trim(),
        bio: editBio.trim() || null,
        tags: parseTags(editTags),
        isPublic: editPublic,
      },
    })
  }

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8'>
      <section className='space-y-3'>
        <h1 className='font-serif text-3xl font-bold tracking-tight'>
          AI角色管理与探索
        </h1>
        <p className='max-w-3xl text-sm leading-6 text-muted-foreground'>
          集中管理角色的名称、简介、标签与公开状态，并支持收藏优秀角色。所有操作都直接映射到你在
          openapi 中定义的角色接口。
        </p>
      </section>

      <section className='grid gap-4 rounded-xl border bg-card p-5 lg:grid-cols-[1fr_auto]'>
        <div className='relative'>
          <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder='输入关键词过滤角色'
            className='pl-10'
          />
        </div>
        <Button onClick={() => setKeyword(searchValue.trim())}>搜索</Button>
      </section>

      <section className='flex items-center justify-between rounded-xl border bg-card p-5'>
        <div className='space-y-1'>
          <p className='text-sm font-medium'>新建角色</p>
          <p className='text-xs text-muted-foreground'>
            角色描述建议包含场景、语气和边界，便于后续维护。
            {!auth.accessToken ? ' 当前为浏览模式，登录后可创建与管理。' : ''}
          </p>
        </div>
        {auth.accessToken ? (
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
        )}
      </section>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建角色</DialogTitle>
            <DialogDescription>
              填写角色设定与标签，并设置公开性，创建后即可被搜索与收藏。
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-3'>
            <Input
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              placeholder='角色名称'
            />
            <Textarea
              value={createBio}
              onChange={(event) => setCreateBio(event.target.value)}
              placeholder='角色简介（可选）'
            />
            <Input
              value={createTags}
              onChange={(event) => setCreateTags(event.target.value)}
              placeholder='角色标签（逗号分隔）'
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

      <section className='grid gap-4 lg:grid-cols-2'>
        {characters.map((item) => (
          <Card key={item.id} className='gap-4 border bg-card py-5'>
            <CardHeader className='px-5'>
              <div className='flex items-start justify-between gap-3'>
                <div className='space-y-2'>
                  <CardTitle className='text-base'>{item.name}</CardTitle>
                  <CardDescription className='line-clamp-2 min-h-10'>
                    {item.bio || '暂无角色简介'}
                  </CardDescription>
                </div>
                <Badge variant={item.isPublic ? 'secondary' : 'outline'}>
                  {item.isPublic ? '公开' : '私有'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-3 px-5 text-sm text-muted-foreground'>
              <p>
                {item.favoriteCount} 收藏 / {item.chatCount} 对话 / 创建于{' '}
                {formatDateTime(item.createdAt)}
              </p>
              {item.tags && item.tags.length > 0 ? (
                <div className='flex flex-wrap gap-2'>
                  {item.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant='outline'>
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => openEdit(item)}
                  disabled={!auth.accessToken}
                >
                  <PencilLine className='size-4' />
                  编辑
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    if (!auth.accessToken) {
                      toast.error('请先登录后再收藏角色')
                      return
                    }

                    const action = item.isFavorited
                      ? cancelFavorite
                      : favoriteCharacter
                    action.mutate({
                      path: { id: item.id },
                    })
                  }}
                >
                  <Heart
                    className={`size-4 ${item.isFavorited ? 'fill-current text-red-500' : ''}`}
                  />
                  {item.isFavorited ? '已收藏' : '收藏'}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type='button'
                      variant='destructive'
                      size='sm'
                      disabled={!auth.accessToken}
                    >
                      <Trash2 className='size-4' />
                      删除
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size='sm'>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认删除角色？</AlertDialogTitle>
                      <AlertDialogDescription>
                        删除后将无法恢复角色设定及其关联会话：{item.name}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction
                        variant='destructive'
                        onClick={() =>
                          deleteCharacter.mutate({
                            path: { id: item.id },
                          })
                        }
                      >
                        确认删除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {characters.length === 0 && (
        <Card className='gap-2 border-dashed py-10 text-center'>
          <CardContent>
            <p className='text-sm text-muted-foreground'>没有匹配的角色</p>
          </CardContent>
        </Card>
      )}

      {editingItem && (
        <Card className='gap-4 border border-dashed bg-card py-5'>
          <CardHeader className='px-5'>
            <CardTitle className='text-base'>
              编辑角色：{editingItem.name}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 px-5'>
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
            <Input
              value={editTags}
              onChange={(event) => setEditTags(event.target.value)}
              placeholder='角色标签（逗号分隔）'
            />
            <div className='flex flex-wrap gap-2'>
              <PublicToggle
                checked={editPublic}
                onCheckedChange={setEditPublic}
                publicLabel='公开角色'
                privateLabel='私有角色'
              />
              <Button
                onClick={handleUpdate}
                disabled={updateCharacter.isPending}
              >
                {updateCharacter.isPending ? '保存中...' : '保存修改'}
              </Button>
              <Button variant='ghost' onClick={() => setEditingItem(null)}>
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {auth.accessToken && favorites.length > 0 && (
        <p className='text-xs text-muted-foreground'>
          你当前收藏了 {favorites.length} 个角色，可在此页直接取消收藏。
        </p>
      )}
    </div>
  )
}

function parseTags(raw: string) {
  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}
