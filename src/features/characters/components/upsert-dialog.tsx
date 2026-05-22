import type { ChangeEvent, RefObject } from 'react'
import { AvatarUploadField } from '#/components/shared/avatar-upload-field'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { CharacterFormFields } from './form-fields'

interface CharacterUpsertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  submitText: string
  submittingText: string
  isSubmitting: boolean
  onSubmit: () => void
  showCancel?: boolean
  cancelText?: string
  onCancel?: () => void
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
  avatarInputRef: RefObject<HTMLInputElement | null>
  avatarPreviewUrl: string
  avatarFallbackText: string
  avatarFileName?: string
  onAvatarFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onAvatarClear: () => void
  avatarBorderClassName?: string
}

export function CharacterUpsertDialog({
  open,
  onOpenChange,
  title,
  description,
  submitText,
  submittingText,
  isSubmitting,
  onSubmit,
  showCancel = false,
  cancelText = '取消',
  onCancel,
  name,
  onNameChange,
  bio,
  onBioChange,
  bioPlaceholder,
  systemPrompt,
  onSystemPromptChange,
  systemPromptPlaceholder,
  baseConfig,
  onBaseConfigChange,
  baseConfigPlaceholder,
  tags,
  onTagsChange,
  isPublic,
  onPublicChange,
  avatarInputRef,
  avatarPreviewUrl,
  avatarFallbackText,
  avatarFileName,
  onAvatarFileChange,
  onAvatarClear,
  avatarBorderClassName,
}: CharacterUpsertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className='space-y-3'>
          <AvatarUploadField
            field='角色'
            inputRef={avatarInputRef}
            previewUrl={avatarPreviewUrl}
            fallbackText={avatarFallbackText}
            selectedFileName={avatarFileName}
            onFileChange={onAvatarFileChange}
            onClear={onAvatarClear}
            avatarBorderClassName={avatarBorderClassName}
          />
          <CharacterFormFields
            name={name}
            onNameChange={onNameChange}
            bio={bio}
            onBioChange={onBioChange}
            bioPlaceholder={bioPlaceholder}
            systemPrompt={systemPrompt}
            onSystemPromptChange={onSystemPromptChange}
            systemPromptPlaceholder={systemPromptPlaceholder}
            baseConfig={baseConfig}
            onBaseConfigChange={onBaseConfigChange}
            baseConfigPlaceholder={baseConfigPlaceholder}
            tags={tags}
            onTagsChange={onTagsChange}
            isPublic={isPublic}
            onPublicChange={onPublicChange}
          />
        </div>
        <DialogFooter>
          {showCancel ? (
            <Button
              variant='ghost'
              onClick={() => {
                if (onCancel) {
                  onCancel()
                  return
                }
                onOpenChange(false)
              }}
            >
              {cancelText}
            </Button>
          ) : null}
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? submittingText : submitText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
