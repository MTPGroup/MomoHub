import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { CharacterDetailActionsPanel } from '#/features/characters/components/detail-actions-panel'
import { CharacterDetailSummaryCard } from '#/features/characters/components/detail-summary-card'
import { CharacterKnowledgeBindingDialog } from '#/features/characters/components/knowledge-binding-dialog'
import { CharacterUpsertDialog } from '#/features/characters/components/upsert-dialog'
import { AuthRequired } from '#/features/auth/components/auth-required'
import { Card, CardContent } from '#/components/ui/card'
import type { useCharacterKnowledgeBinding } from '#/features/characters/hooks/use-character-knowledge-binding'
import type { useAuth } from '#/hooks/use-auth'
import { getInitialChar } from '#/utils/character'
import type { CharacterDetailState } from '../hooks/use-character-detail'

type AuthState = ReturnType<typeof useAuth>
type KnowledgeBindingState = ReturnType<typeof useCharacterKnowledgeBinding>

export function CharacterDetailContent({
  auth,
  detail,
  knowledgeBinding,
}: {
  auth: AuthState
  detail: CharacterDetailState
  knowledgeBinding: KnowledgeBindingState
}) {
  const character = detail.data.character

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

        {!character && detail.state.isLoading && (
          <Card className='border-dashed py-10 text-center'>
            <CardContent>
              <p className='text-sm text-muted-foreground'>角色加载中...</p>
            </CardContent>
          </Card>
        )}

        {!character && !detail.state.isLoading && (
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
              favoritePending={detail.state.isFavoritePending}
              deletePending={detail.state.isDeleting}
              onEdit={detail.actions.openEditDialog}
              onOpenDetailTest={detail.actions.openDetailTest}
              onOpenKnowledgeBinding={() =>
                detail.actions.setKnowledgeBindingDialogOpen(true)
              }
              onToggleFavorite={detail.actions.toggleFavorite}
              onDelete={detail.actions.delete}
            />
          </div>
        )}

        <CharacterUpsertDialog
          open={detail.state.editingOpen}
          onOpenChange={(open) => {
            detail.actions.setEditingOpen(open)
            if (!open) {
              detail.actions.clearEditAvatarSelection(character?.avatar || '')
            }
          }}
          title='编辑角色'
          description='修改角色名称、简介、标签和可见性，保存后立即生效。'
          submitText='保存修改'
          submittingText='保存中...'
          isSubmitting={detail.state.isUpdating}
          onSubmit={detail.actions.update}
          showCancel
          cancelText='取消'
          onCancel={() => detail.actions.setEditingOpen(false)}
          name={detail.form.editName}
          onNameChange={detail.form.setEditName}
          bio={detail.form.editBio}
          onBioChange={detail.form.setEditBio}
          bioPlaceholder='角色简介'
          systemPrompt={detail.form.editSystemPrompt}
          onSystemPromptChange={detail.form.setEditSystemPrompt}
          systemPromptPlaceholder='系统提示词（systemPrompt，可选）'
          baseConfig={detail.form.editBaseConfig}
          onBaseConfigChange={detail.form.setEditBaseConfig}
          baseConfigPlaceholder='LLM 参数 JSON（baseConfig，可选）'
          tags={detail.form.editTags}
          onTagsChange={detail.form.setEditTags}
          isPublic={detail.form.editPublic}
          onPublicChange={detail.form.setEditPublic}
          avatarInputRef={detail.refs.editAvatarInputRef}
          avatarPreviewUrl={detail.form.editAvatarPreviewUrl}
          avatarFallbackText={getInitialChar(
            detail.form.editName || character?.name,
          )}
          avatarFileName={detail.form.editAvatarFile?.name}
          onAvatarFileChange={detail.actions.changeEditAvatar}
          onAvatarClear={() =>
            detail.actions.clearEditAvatarSelection(character?.avatar || '')
          }
        />
        <CharacterKnowledgeBindingDialog
          open={detail.state.knowledgeBindingDialogOpen}
          onOpenChange={detail.actions.setKnowledgeBindingDialogOpen}
          linkedKnowledgeBases={knowledgeBinding.linkedKnowledgeBases}
          availableKnowledgeBases={knowledgeBinding.availableKnowledgeBases}
          isMutating={knowledgeBinding.isKnowledgeBindingMutating}
          onToggleBinding={knowledgeBinding.toggleKnowledgeBaseBinding}
        />
      </div>
    </AuthRequired>
  )
}
