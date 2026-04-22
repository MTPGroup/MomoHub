import { Field, FieldLabel } from '#/components/ui/field'
import { Switch } from '#/components/ui/switch'

interface PublicFieldProps {
  checked: boolean
  onCheckedChange: (next: boolean) => void
  publicLabel?: string
  privateLabel?: string
  className?: string
}

export function PublicField({
  checked,
  onCheckedChange,
  publicLabel = '公开',
  privateLabel = '私有',
  className,
}: PublicFieldProps) {
  return (
    <Field orientation='horizontal'>
      <Switch
        id='public-switch'
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={className}
      />
      <FieldLabel htmlFor='public-switch'>
        {checked ? publicLabel : privateLabel}
      </FieldLabel>
    </Field>
  )
}
