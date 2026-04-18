import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { FileUp, PencilLine, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  createKbMutation,
  deleteKbMutation,
  listKbsOptions,
  listKbsQueryKey,
  updateKbMutation,
  uploadDocumentMutation,
} from '#/client/@tanstack/react-query.gen'
import type { KnowledgeBaseOut } from '#/client/types.gen'
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

export const Route = createFileRoute('/knowledge-bases')({
  component: KnowledgeBasesPage,
})

function KnowledgeBasesPage() {
  const auth = useAuth()
  const queryClient = useQueryClient()

  const [keyword, setKeyword] = useState('')
  const [searchValue, setSearchValue] = useState('')

  const [createName, setCreateName] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [createPublic, setCreatePublic] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const [editingItem, setEditingItem] = useState<KnowledgeBaseOut | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editPublic, setEditPublic] = useState(false)

  const kbQuery = useQuery(
    listKbsOptions({
      query: { page: 1, page_size: 30, keyword: keyword || undefined },
    }),
  )

  const createKb = useMutation({
    ...createKbMutation(),
    onSuccess: () => {
      toast.success('知识库已创建')
      setCreateName('')
      setCreateDescription('')
      setCreatePublic(false)
      setCreateDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: listKbsQueryKey() })
    },
    onError: (error) => {
      toast.error('创建失败', { description: error.message || '请稍后重试' })
    },
  })

  const updateKb = useMutation({
    ...updateKbMutation(),
    onSuccess: () => {
      toast.success('知识库已更新')
      setEditingItem(null)
      queryClient.invalidateQueries({ queryKey: listKbsQueryKey() })
    },
    onError: (error) => {
      toast.error('更新失败', { description: error.message || '请稍后重试' })
    },
  })

  const deleteKb = useMutation({
    ...deleteKbMutation(),
    onSuccess: () => {
      toast.success('知识库已删除')
      queryClient.invalidateQueries({ queryKey: listKbsQueryKey() })
    },
    onError: (error) => {
      toast.error('删除失败', { description: error.message || '请稍后重试' })
    },
  })

  const uploadDocument = useMutation({
    ...uploadDocumentMutation(),
    onSuccess: () => {
      toast.success('文档上传成功')
      queryClient.invalidateQueries({ queryKey: listKbsQueryKey() })
    },
    onError: (error) => {
      toast.error('上传失败', { description: error.message || '请稍后重试' })
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

  const openEdit = (item: KnowledgeBaseOut) => {
    setEditingItem(item)
    setEditName(item.name)
    setEditDescription(item.description || '')
    setEditPublic(Boolean(item.isPublic))
  }

  const handleUpdate = () => {
    if (!editingItem) {
      return
    }

    if (!editName.trim()) {
      toast.error('请输入知识库名称')
      return
    }

    updateKb.mutate({
      path: { id: editingItem.id },
      body: {
        name: editName.trim(),
        description: editDescription.trim() || null,
        isPublic: editPublic,
      },
    })
  }

  const handleUpload = (knowledgeBaseId: string, file?: File | null) => {
    if (!file) {
      return
    }

    uploadDocument.mutate({
      path: { id: knowledgeBaseId },
      body: { file },
    })
  }

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8'>
      <section className='space-y-3'>
        <h1 className='font-serif text-3xl font-bold tracking-tight'>
          知识库管理与探索
        </h1>
        <p className='max-w-3xl text-sm leading-6 text-muted-foreground'>
          支持关键词探索市场知识库，也支持你创建私有/公开知识库并上传文档。页面已覆盖核心管理动作：创建、编辑、删除、上传。
        </p>
      </section>

      <section className='grid gap-4 rounded-xl border bg-card p-5 lg:grid-cols-[1fr_auto]'>
        <div className='relative'>
          <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder='输入关键词过滤知识库'
            className='pl-10'
          />
        </div>
        <Button onClick={() => setKeyword(searchValue.trim())}>搜索</Button>
      </section>

      <section className='flex items-center justify-between rounded-xl border bg-card p-5'>
        <div className='space-y-1'>
          <p className='text-sm font-medium'>新建知识库</p>
          <p className='text-xs text-muted-foreground'>
            建议为每个业务域维护独立知识库，便于角色复用。
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

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建知识库</DialogTitle>
            <DialogDescription>
              填写基本信息并设置公开性，创建后即可上传文档进行索引。
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-3'>
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

      <section className='grid gap-4 lg:grid-cols-2'>
        {allItems.map((item) => (
          <Card key={item.id} className='gap-4 border bg-card py-5'>
            <CardHeader className='px-5'>
              <div className='flex items-start justify-between gap-3'>
                <div className='space-y-2'>
                  <CardTitle className='text-base'>{item.name}</CardTitle>
                  <CardDescription className='line-clamp-2 min-h-10'>
                    {item.description || '暂无描述'}
                  </CardDescription>
                </div>
                <Badge variant={item.isPublic ? 'secondary' : 'outline'}>
                  {item.isPublic ? '公开' : '私有'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-3 px-5 text-sm text-muted-foreground'>
              <p>
                {item.documentCount} 文档 / {item.chunkCount} 片段 / 状态{' '}
                {item.status}
              </p>
              <p>更新时间：{formatDateTime(item.updatedAt)}</p>
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
                <label className='inline-flex'>
                  <input
                    type='file'
                    className='hidden'
                    disabled={!auth.accessToken}
                    onChange={(event) => {
                      handleUpload(item.id, event.target.files?.[0])
                      event.currentTarget.value = ''
                    }}
                  />
                  <Button type='button' variant='outline' size='sm' asChild>
                    <span>
                      <FileUp className='size-4' />
                      上传文档
                    </span>
                  </Button>
                </label>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type='button'
                      variant='destructive'
                      size='sm'
                      disabled={deleteKb.isPending || !auth.accessToken}
                    >
                      <Trash2 className='size-4' />
                      删除
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size='sm'>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认删除知识库？</AlertDialogTitle>
                      <AlertDialogDescription>
                        删除后将无法恢复知识库及其文档索引：{item.name}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction
                        variant='destructive'
                        onClick={() =>
                          deleteKb.mutate({
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

      {allItems.length === 0 && (
        <Card className='gap-2 border-dashed py-10 text-center'>
          <CardContent>
            <p className='text-sm text-muted-foreground'>没有匹配的知识库</p>
          </CardContent>
        </Card>
      )}

      {editingItem && (
        <Card className='gap-4 border border-dashed bg-card py-5'>
          <CardHeader className='px-5'>
            <CardTitle className='text-base'>
              编辑知识库：{editingItem.name}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 px-5'>
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
            <div className='flex flex-wrap gap-2'>
              <PublicToggle
                checked={editPublic}
                onCheckedChange={setEditPublic}
                publicLabel='公开知识库'
                privateLabel='私有知识库'
              />
              <Button onClick={handleUpdate} disabled={updateKb.isPending}>
                {updateKb.isPending ? '保存中...' : '保存修改'}
              </Button>
              <Button variant='ghost' onClick={() => setEditingItem(null)}>
                取消
              </Button>
            </div>
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
