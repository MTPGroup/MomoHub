import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  cancelFavoriteCharacterMutation,
  deleteCharacterMutation,
  favoriteCharacterMutation,
  getCharactersQueryKey,
  getPublicCharacterOptions,
  getPublicCharacterQueryKey,
  updateCharacterMutation,
  uploadCharacterAvatarMutation,
} from '#/client/@tanstack/react-query.gen'
import type { ApiResponseCharacterDetailOut } from '#/client/types.gen'
import { CharacterDetailActionsPanel } from '#/components/features/character/detail-actions-panel'
import { CharacterDetailSummaryCard } from '#/components/features/character/detail-summary-card'
import { CharacterKnowledgeBindingDialog } from '#/components/features/character/knowledge-binding-dialog'
import { CharacterUpsertDialog } from '#/components/features/character/upsert-dialog'
import { AuthRequired } from '#/components/shared/auth-required'
import { Card, CardContent } from '#/components/ui/card'
import { useCharacterKnowledgeBinding } from '#/hooks/character/use-knowledge-binding'
import { useAuth } from '#/stores/auth'
import {
  getInitialChar,
  parseBaseConfigFromText,
  revokeObjectUrl,
} from '#/utils/character'

export const Route = createFileRoute('/characters/$id')({
  component: CharacterDetailPage,
})

function CharacterDetailPage() {
  const { id } = Route.useParams()
  const auth = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isDetailPage = pathname === `/characters/${id}`
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
  const [knowledgeBindingDialogOpen, setKnowledgeBindingDialogOpen] =
    useState(false)

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
    ...getPublicCharacterOptions({
      path: { id },
    }),
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
        queryKey: getPublicCharacterQueryKey({
          path: { id },
        }),
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
        getPublicCharacterQueryKey({
          path: { id },
        }),
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
        getPublicCharacterQueryKey({
          path: { id },
        }),
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
  const knowledgeBinding = useCharacterKnowledgeBinding({
    characterId: id,
    isAuthenticated: auth.isLoggedIn,
  })

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

  if (!isDetailPage) {
    return <Outlet />
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
              <CharacterDetailSummaryCard character={character} />
            </div>

            <CharacterDetailActionsPanel
              characterId={character.id}
              characterName={character.name}
              isFavorited={character.isFavorited}
              canOpenKnowledgeBinding={auth.isLoggedIn}
              favoritePending={
                favoriteCharacter.isPending || cancelFavorite.isPending
              }
              deletePending={deleteCharacter.isPending}
              onEdit={openEditDialog}
              onOpenDetailTest={(characterId) => {
                void navigate({
                  to: '/characters/$id/detail-test',
                  params: { id: characterId },
                })
              }}
              onOpenKnowledgeBinding={() => setKnowledgeBindingDialogOpen(true)}
              onToggleFavorite={() => {
                const action = character.isFavorited
                  ? cancelFavorite
                  : favoriteCharacter
                action.mutate({
                  path: { id: character.id },
                })
              }}
              onDelete={(characterId) =>
                deleteCharacter.mutate({
                  path: { id: characterId },
                })
              }
            />
          </div>
        )}

        <CharacterUpsertDialog
          open={editingOpen}
          onOpenChange={(open) => {
            setEditingOpen(open)
            if (!open) {
              clearEditAvatarSelection(character?.avatar || '')
            }
          }}
          title='编辑角色'
          description='修改角色名称、简介、标签和可见性，保存后立即生效。'
          submitText='保存修改'
          submittingText='保存中...'
          isSubmitting={updateCharacter.isPending}
          onSubmit={handleUpdate}
          showCancel
          cancelText='取消'
          onCancel={() => setEditingOpen(false)}
          name={editName}
          onNameChange={setEditName}
          bio={editBio}
          onBioChange={setEditBio}
          bioPlaceholder='角色简介'
          systemPrompt={editSystemPrompt}
          onSystemPromptChange={setEditSystemPrompt}
          systemPromptPlaceholder='系统提示词（systemPrompt，可选）'
          baseConfig={editBaseConfig}
          onBaseConfigChange={setEditBaseConfig}
          baseConfigPlaceholder='LLM 参数 JSON（baseConfig，可选）'
          tags={editTags}
          onTagsChange={setEditTags}
          isPublic={editPublic}
          onPublicChange={setEditPublic}
          avatarInputRef={editAvatarInputRef}
          avatarPreviewUrl={editAvatarPreviewUrl}
          avatarFallbackText={getInitialChar(editName || character?.name)}
          avatarFileName={editAvatarFile?.name}
          onAvatarFileChange={handleEditAvatarChange}
          onAvatarClear={() =>
            clearEditAvatarSelection(character?.avatar || '')
          }
        />
        <CharacterKnowledgeBindingDialog
          open={knowledgeBindingDialogOpen}
          onOpenChange={setKnowledgeBindingDialogOpen}
          linkedKnowledgeBases={knowledgeBinding.linkedKnowledgeBases}
          availableKnowledgeBases={knowledgeBinding.availableKnowledgeBases}
          isMutating={knowledgeBinding.isKnowledgeBindingMutating}
          onToggleBinding={knowledgeBinding.toggleKnowledgeBaseBinding}
        />
      </div>
    </AuthRequired>
  )
}
