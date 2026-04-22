import {
  Bolt,
  Download,
  Loader2,
  RotateCcw,
  Send,
  Square,
  Trash2,
  Upload,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from '#/components/ui/chat-container'
import { Loader } from '#/components/ui/loader'
import { Message, MessageAvatar, MessageContent } from '#/components/ui/message'
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from '#/components/ui/prompt-input'
import { extractMessageText } from '#/utils/character-test'

type ChatPanelMessage = {
  id: string
  role: string
  parts: unknown[]
}

type CharacterBrief = {
  name?: string | null
  avatar?: string | null
}

type UserBrief = {
  accessToken: string
  avatar?: string | null
  name?: string | null
}

type CharacterDetailTestChatPanelProps = {
  character: CharacterBrief | null | undefined
  auth: UserBrief
  chatMessages: ChatPanelMessage[]
  message: string
  isStreaming: boolean
  onMessageChange: (value: string) => void
  onSend: () => void
  onStop: () => void
  onImportChat: () => void
  onExportChat: () => void
  onDeleteSession: () => void
  hasTempSession: boolean
  onResetSession: () => void
  onOpenTuning: () => void
}

export function CharacterDetailTestChatPanel({
  character,
  auth,
  chatMessages,
  message,
  isStreaming,
  onMessageChange,
  onSend,
  onStop,
  onExportChat,
  onImportChat,
  onDeleteSession,
  hasTempSession,
  onResetSession,
  onOpenTuning,
}: CharacterDetailTestChatPanelProps) {
  return (
    <Card className='flex min-h-[72vh] flex-col border border-border/80 bg-card/95 shadow-sm'>
      <CardHeader className='space-y-2 border-b px-5'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <CardTitle className='flex text-base items-center'>
            <Avatar className='size-12'>
              <AvatarImage
                src={character?.avatar || ''}
                aria-label='角色头像'
              />
              <AvatarFallback>{character?.name || 'T'}</AvatarFallback>
            </Avatar>
            <p className='pl-4'>{character?.name || '角色会话测试'}</p>
          </CardTitle>
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              size='icon'
              onClick={onExportChat}
              disabled={isStreaming}
              title='导出会话'
              aria-label='导出会话'
            >
              <Download className='size-4' />
            </Button>
            <Button
              type='button'
              variant='outline'
              size='icon'
              onClick={onImportChat}
              disabled={isStreaming}
              title='导入会话'
              aria-label='导入会话'
            >
              <Upload className='size-4' />
            </Button>
            <Button
              type='button'
              variant='outline'
              size='icon'
              onClick={onDeleteSession}
              disabled={isStreaming || !hasTempSession}
              title='删除当前临时会话'
              aria-label='删除当前临时会话'
            >
              <Trash2 className='size-4' />
            </Button>
            <Button
              type='button'
              variant='outline'
              size='icon'
              onClick={onResetSession}
              disabled={isStreaming}
              title='新建临时会话'
              aria-label='新建临时会话'
            >
              <RotateCcw className='size-4' />
            </Button>
            <Button
              type='button'
              variant='outline'
              size='icon'
              onClick={onOpenTuning}
              title='角色调参'
              aria-label='角色调参'
            >
              <Bolt className='size-4' />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='flex-1 overflow-y-auto'>
        {chatMessages.length === 0 ? (
          <div className='flex h-full items-center justify-center rounded-sm border border-dashed border-border/80 bg-muted/25  text-center text-sm text-muted-foreground'>
            发送第一条消息开始测试角色对话效果
          </div>
        ) : (
          <ChatContainerRoot className='h-full'>
            <ChatContainerContent className='space-y-4'>
              {chatMessages.map((item) => {
                const text = extractMessageText(item.parts)
                const showStreamLoader =
                  item.role === 'assistant' && isStreaming && !text.trim()

                return (
                  <Message
                    key={item.id}
                    className={
                      item.role === 'user' ? 'justify-end' : 'justify-start'
                    }
                  >
                    {item.role === 'assistant' ? (
                      <MessageAvatar
                        src={character?.avatar || ''}
                        alt='角色头像'
                        fallback={character?.name?.slice(0, 1) || 'R'}
                      />
                    ) : null}
                    {showStreamLoader ? (
                      <div className='inline-flex items-center gap-2 text-muted-foreground'>
                        <Loader variant='dots' />
                      </div>
                    ) : (
                      <MessageContent markdown className='max-w-[80%]'>
                        {text}
                      </MessageContent>
                    )}
                    {item.role === 'user' ? (
                      <MessageAvatar
                        src={auth.avatar || ''}
                        alt='我的头像'
                        fallback={auth.name?.slice(0, 1) || '我'}
                      />
                    ) : null}
                  </Message>
                )
              })}
              <ChatContainerScrollAnchor />
            </ChatContainerContent>
          </ChatContainerRoot>
        )}
      </CardContent>
      <CardFooter className='border-t'>
        <PromptInput
          className='w-full rounded-xl'
          value={message}
          onValueChange={onMessageChange}
          isLoading={isStreaming}
          disabled={!auth.accessToken}
          onSubmit={() => {
            if (!isStreaming && message.trim()) {
              onSend()
            }
          }}
        >
          <PromptInputTextarea placeholder='输入测试消息，Shift + Enter 换行' />
          <PromptInputActions className='justify-end'>
            {isStreaming && (
              <PromptInputAction tooltip='停止生成' side='top'>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  onClick={onStop}
                >
                  <Square className='size-4' />
                </Button>
              </PromptInputAction>
            )}
            <PromptInputAction tooltip='发送消息'>
              <Button
                type='button'
                size='icon'
                onClick={onSend}
                disabled={isStreaming || !message.trim()}
              >
                {isStreaming ? (
                  <Loader2 className='size-4 animate-spin' />
                ) : (
                  <Send className='size-4' />
                )}
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>
      </CardFooter>
    </Card>
  )
}
