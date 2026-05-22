import { PublicField } from '#/components/shared/public-toggle'
import { TagInput } from '#/components/shared/tag-input'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'

type CharacterFormFieldsProps = {
  name: string
  onNameChange: (value: string) => void
  bio: string
  onBioChange: (value: string) => void
  bioPlaceholder?: string
  systemPrompt: string
  onSystemPromptChange: (value: string) => void
  systemPromptPlaceholder?: string
  baseConfig: string
  onBaseConfigChange: (value: string) => void
  baseConfigPlaceholder?: string
  tags: string[]
  onTagsChange: (value: string[]) => void
  isPublic: boolean
  onPublicChange: (value: boolean) => void
}

export function CharacterFormFields({
  name,
  onNameChange,
  bio,
  onBioChange,
  bioPlaceholder = '角色简介（可选）',
  systemPrompt,
  onSystemPromptChange,
  systemPromptPlaceholder = '系统提示词（可选）',
  baseConfig,
  onBaseConfigChange,
  baseConfigPlaceholder = 'LLM 参数 JSON（baseConfig，可选）',
  tags,
  onTagsChange,
  isPublic,
  onPublicChange,
}: CharacterFormFieldsProps) {
  return (
    <>
      <Input
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder='角色名称'
      />
      <Textarea
        value={bio}
        onChange={(event) => onBioChange(event.target.value)}
        placeholder={bioPlaceholder}
      />
      <Textarea
        value={systemPrompt}
        onChange={(event) => onSystemPromptChange(event.target.value)}
        placeholder={systemPromptPlaceholder}
      />
      <Textarea
        value={baseConfig}
        onChange={(event) => onBaseConfigChange(event.target.value)}
        placeholder={baseConfigPlaceholder}
        className='font-mono text-xs'
      />
      <TagInput
        value={tags}
        onChange={onTagsChange}
        placeholder='添加角色标签，按回车确认'
      />
      <PublicField checked={isPublic} onCheckedChange={onPublicChange} />
    </>
  )
}
