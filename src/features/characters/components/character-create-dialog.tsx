import { CharacterUpsertDialog } from '#/features/characters/components/upsert-dialog'
import { getInitialChar } from '#/utils/character'
import type { CharacterListState } from '../hooks/use-character-list'

const BASE_CONFIG_PLACEHOLDER = `// 角色配置JSON（可选）
{
  "temperature": 0.7,
  "topP": 1,
  "maxTokens": 2000,
  "presencePenalty": 0,
  "frequencyPenalty": 0
}`

export function CharacterCreateDialog({
  list,
}: {
  list: CharacterListState
}) {
  return (
    <CharacterUpsertDialog
      open={list.state.createDialogOpen}
      onOpenChange={(open) => {
        list.actions.setCreateDialogOpen(open)
        if (!open) {
          list.actions.clearCreateAvatarSelection()
        }
      }}
      title='新建角色'
      description='填写角色设定与标签，并设置公开性，创建后会自动跳转到管理页。'
      submitText='创建角色'
      submittingText='创建中...'
      isSubmitting={list.state.isCreating}
      onSubmit={list.actions.create}
      name={list.form.createName}
      onNameChange={list.form.setCreateName}
      bio={list.form.createBio}
      onBioChange={list.form.setCreateBio}
      systemPrompt={list.form.createSystemPrompt}
      onSystemPromptChange={list.form.setCreateSystemPrompt}
      baseConfig={list.form.createBaseConfig}
      onBaseConfigChange={list.form.setCreateBaseConfig}
      baseConfigPlaceholder={BASE_CONFIG_PLACEHOLDER}
      tags={list.form.createTags}
      onTagsChange={list.form.setCreateTags}
      isPublic={list.form.createPublic}
      onPublicChange={list.form.setCreatePublic}
      avatarInputRef={list.refs.createAvatarInputRef}
      avatarPreviewUrl={list.form.createAvatarPreviewUrl}
      avatarFallbackText={getInitialChar(list.form.createName)}
      avatarFileName={list.form.createAvatarFile?.name}
      onAvatarFileChange={list.actions.changeCreateAvatar}
      onAvatarClear={list.actions.clearCreateAvatarSelection}
      avatarBorderClassName='border border-border/80'
    />
  )
}
