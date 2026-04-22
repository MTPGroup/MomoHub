import { Camera } from 'lucide-react'
import type { ChangeEvent, RefObject } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'

interface AvatarUploadFieldProps {
  field: string
  inputRef: RefObject<HTMLInputElement | null>
  previewUrl: string
  fallbackText: string
  selectedFileName?: string
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  clearButtonText?: string
  avatarBorderClassName?: string
}

export function AvatarUploadField({
  field,
  inputRef,
  previewUrl,
  fallbackText,
  selectedFileName,
  onFileChange,
  onClear,
  clearButtonText = '清除',
  avatarBorderClassName = 'border border-border',
}: AvatarUploadFieldProps) {
  return (
    <div className='flex items-center gap-4'>
      <button
        type='button'
        className='group relative'
        onClick={() => inputRef.current?.click()}
        aria-label={`选择${field}头像`}
      >
        <Avatar className={`size-16 ${avatarBorderClassName}`}>
          <AvatarImage src={previewUrl} alt={`${field}头像预览`} />
          <AvatarFallback className='text-base'>{fallbackText}</AvatarFallback>
        </Avatar>
        <div className='absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 opacity-0 transition-opacity group-hover:opacity-100'>
          <Camera className='size-4 text-background' />
        </div>
      </button>
      <div className='min-w-0 flex-1 space-y-1'>
        <p className='text-sm font-medium'>{`${field}头像`}</p>
        <p className='truncate text-xs text-muted-foreground'>
          {selectedFileName || '点击头像选择本地图片'}
        </p>
      </div>
      {selectedFileName ? (
        <Button type='button' variant='ghost' size='sm' onClick={onClear}>
          {clearButtonText}
        </Button>
      ) : null}
      <input
        ref={inputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={onFileChange}
      />
    </div>
  )
}
