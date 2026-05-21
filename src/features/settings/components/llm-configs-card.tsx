import { Plus } from 'lucide-react'
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
import { Input } from '#/components/ui/input'
import type { LlmConfigsState } from '../hooks/use-llm-configs'

export function LlmConfigsCard({
  llmConfigs,
}: {
  llmConfigs: LlmConfigsState
}) {
  return (
    <Card className='gap-4 border border-border/80 bg-card/95 py-5 shadow-sm'>
      <CardHeader className='px-5'>
        <CardTitle className='text-base'>LLM 配置管理</CardTitle>
        <CardDescription>
          支持创建、启停、删除模型配置。后续可在会话创建时按配置切换模型。
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4 px-5'>
        <div className='grid gap-3 md:grid-cols-4'>
          <Input
            value={llmConfigs.form.name}
            onChange={(event) => llmConfigs.form.setName(event.target.value)}
            placeholder='配置名称'
          />
          <Input
            value={llmConfigs.form.provider}
            onChange={(event) =>
              llmConfigs.form.setProvider(event.target.value)
            }
            placeholder='provider'
          />
          <Input
            value={llmConfigs.form.model}
            onChange={(event) => llmConfigs.form.setModel(event.target.value)}
            placeholder='model'
          />
          <Input
            value={llmConfigs.form.baseUrl}
            onChange={(event) => llmConfigs.form.setBaseUrl(event.target.value)}
            placeholder='baseUrl（可选）'
          />
        </div>
        <Button onClick={llmConfigs.actions.create}>
          <Plus className='size-4' />
          新增模型配置
        </Button>

        <div className='grid gap-3 md:grid-cols-2'>
          {llmConfigs.data.llmConfigs.map((item) => (
            <div
              key={item.id}
              className='rounded-md border border-border/80 bg-background/70 p-3'
            >
              <div className='flex items-center justify-between gap-2'>
                <p className='text-sm font-medium'>{item.name}</p>
                <Badge variant={item.isActive ? 'secondary' : 'outline'}>
                  {item.isActive ? '活跃' : '未启用'}
                </Badge>
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>
                {item.provider} / {item.model}
              </p>
              <div className='mt-2 flex flex-wrap gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() =>
                    llmConfigs.actions.toggleActive(item.id, item.isActive)
                  }
                >
                  {item.isActive ? '设为非活跃' : '设为活跃'}
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => llmConfigs.actions.startEditing(item)}
                >
                  编辑
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size='sm' variant='destructive'>
                      删除
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size='sm'>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认删除模型配置？</AlertDialogTitle>
                      <AlertDialogDescription>
                        将删除配置「{item.name}
                        」，已关联会话可能需要重新选择模型。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction
                        variant='destructive'
                        onClick={() => llmConfigs.actions.delete(item.id)}
                      >
                        确认删除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>

        {llmConfigs.state.editingLlmId && (
          <div className='rounded-md border border-dashed border-border/80 bg-background/40 p-3'>
            <p className='mb-3 text-sm font-medium'>
              编辑配置：{llmConfigs.state.editingLlmId}
            </p>
            <div className='grid gap-3 md:grid-cols-4'>
              <Input
                value={llmConfigs.form.name}
                onChange={(event) =>
                  llmConfigs.form.setName(event.target.value)
                }
                placeholder='配置名称'
              />
              <Input
                value={llmConfigs.form.provider}
                onChange={(event) =>
                  llmConfigs.form.setProvider(event.target.value)
                }
                placeholder='provider'
              />
              <Input
                value={llmConfigs.form.model}
                onChange={(event) =>
                  llmConfigs.form.setModel(event.target.value)
                }
                placeholder='model'
              />
              <Input
                value={llmConfigs.form.baseUrl}
                onChange={(event) =>
                  llmConfigs.form.setBaseUrl(event.target.value)
                }
                placeholder='baseUrl（可选）'
              />
            </div>
            <div className='mt-3 flex flex-wrap gap-2'>
              <Button onClick={llmConfigs.actions.update}>保存更新</Button>
              <Button
                variant='ghost'
                onClick={llmConfigs.actions.cancelEditing}
              >
                取消
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
