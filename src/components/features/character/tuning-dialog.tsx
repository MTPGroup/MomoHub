import { Loader2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Slider } from '#/components/ui/slider'
import { Textarea } from '#/components/ui/textarea'
import { formatDateTime } from '#/lib/format'

type CharacterBrief = {
  name?: string | null
  updatedAt?: string | null
}

type CharacterDetailTestTuningDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  character: CharacterBrief | null | undefined
  systemPromptDraft: string
  onSystemPromptDraftChange: (value: string) => void
  temperatureInput: string
  onTemperatureInputChange: (value: string) => void
  topPInput: string
  onTopPInputChange: (value: string) => void
  maxTokensInput: string
  onMaxTokensInputChange: (value: string) => void
  presencePenaltyInput: string
  onPresencePenaltyInputChange: (value: string) => void
  frequencyPenaltyInput: string
  onFrequencyPenaltyInputChange: (value: string) => void
  isStreaming: boolean
  isSyncingSessionParams: boolean
  hasPendingSessionParamChanges: boolean
  tempChatId: string
  appliedParams: Record<string, unknown>
  isSavingTuning: boolean
  onSaveTuning: () => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function parseSliderValue(
  raw: string,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return fallback
  return clamp(parsed, min, max)
}

type SliderFieldProps = {
  label: string
  min: number
  max: number
  step: number
  value: number
  disabled: boolean
  onValueChange: (next: number) => void
}

function SliderField({
  label,
  min,
  max,
  step,
  value,
  disabled,
  onValueChange,
}: SliderFieldProps) {
  const isInteger = step >= 1
  const display = isInteger ? String(Math.round(value)) : value.toFixed(2)

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between text-xs'>
        <span className='text-muted-foreground'>{label}</span>
        <span className='font-mono text-foreground'>{display}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        disabled={disabled}
        onValueChange={(values) => {
          onValueChange(values[0] ?? value)
        }}
      />
      <div className='flex justify-between text-[10px] text-muted-foreground'>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

export function CharacterDetailTestTuningDialog({
  open,
  onOpenChange,
  character,
  systemPromptDraft,
  onSystemPromptDraftChange,
  temperatureInput,
  onTemperatureInputChange,
  topPInput,
  onTopPInputChange,
  maxTokensInput,
  onMaxTokensInputChange,
  presencePenaltyInput,
  onPresencePenaltyInputChange,
  frequencyPenaltyInput,
  onFrequencyPenaltyInputChange,
  isStreaming,
  isSavingTuning,
  onSaveTuning,
}: CharacterDetailTestTuningDialogProps) {
  const temperature = parseSliderValue(temperatureInput, 0.7, 0, 2)
  const topP = parseSliderValue(topPInput, 1, 0, 1)
  const maxTokens = parseSliderValue(maxTokensInput, 2000, 1, 8192)
  const presencePenalty = parseSliderValue(presencePenaltyInput, 0, -2, 2)
  const frequencyPenalty = parseSliderValue(frequencyPenaltyInput, 0, -2, 2)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>角色调参</DialogTitle>
          <DialogDescription>
            {character
              ? `${character.name} · 更新于 ${formatDateTime(character.updatedAt || '')}`
              : '角色信息加载中...'}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-3'>
          <div className='rounded-md border border-dashed p-3 text-xs text-muted-foreground'>
            模型配置采用自动策略：优先使用你的活跃 LLM
            配置；若无活跃配置则使用官方配置。
          </div>
          <Textarea
            value={systemPromptDraft}
            onChange={(event) => onSystemPromptDraftChange(event.target.value)}
            placeholder='系统提示词（保存后生效）'
            className='min-h-28'
          />
          <div className='grid gap-4'>
            <SliderField
              label='temperature'
              min={0}
              max={2}
              step={0.01}
              value={temperature}
              disabled={isStreaming}
              onValueChange={(next) =>
                onTemperatureInputChange(next.toFixed(2))
              }
            />
            <SliderField
              label='topP'
              min={0}
              max={1}
              step={0.01}
              value={topP}
              disabled={isStreaming}
              onValueChange={(next) => onTopPInputChange(next.toFixed(2))}
            />
            <SliderField
              label='maxTokens'
              min={1}
              max={8192}
              step={1}
              value={maxTokens}
              disabled={isStreaming}
              onValueChange={(next) =>
                onMaxTokensInputChange(String(Math.round(next)))
              }
            />
            <SliderField
              label='presencePenalty'
              min={-2}
              max={2}
              step={0.01}
              value={presencePenalty}
              disabled={isStreaming}
              onValueChange={(next) =>
                onPresencePenaltyInputChange(next.toFixed(2))
              }
            />
            <SliderField
              label='frequencyPenalty'
              min={-2}
              max={2}
              step={0.01}
              value={frequencyPenalty}
              disabled={isStreaming}
              onValueChange={(next) =>
                onFrequencyPenaltyInputChange(next.toFixed(2))
              }
            />
          </div>
          {/* {isSyncingSessionParams ? ( */}
          {/*   <p className='text-xs text-muted-foreground'>正在同步会话参数...</p> */}
          {/* ) : hasPendingSessionParamChanges ? ( */}
          {/*   <p className='text-xs text-muted-foreground'> */}
          {/*     参数已修改，等待同步到当前测试会话。 */}
          {/*   </p> */}
          {/* ) : tempChatId ? ( */}
          {/*   <p className='text-xs text-muted-foreground'> */}
          {/*     当前会话参数已应用。已落库参数： */}
          {/*     {Object.keys(appliedParams).length > 0 */}
          {/*       ? ` ${JSON.stringify(appliedParams)}` */}
          {/*       : ' 默认角色参数'} */}
          {/*   </p> */}
          {/* ) : ( */}
          {/*   <p className='text-xs text-muted-foreground'> */}
          {/*     参数将写入当前测试会话。 */}
          {/*   </p> */}
          {/* )} */}
          <Button
            type='button'
            variant='outline'
            onClick={onSaveTuning}
            disabled={isSavingTuning}
            className='w-full'
          >
            {isSavingTuning ? (
              <Loader2 className='size-4 animate-spin' />
            ) : null}
            保存调参到角色
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
