import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { CharacterDetailTestChatPanel } from '#/components/features/character/chat-panel'
import { CharacterKnowledgeBindingDialog } from '#/components/features/character/knowledge-binding-dialog'
import { CharacterDetailTestTuningDialog } from '#/components/features/character/tuning-dialog'
import { AuthRequired } from '#/components/shared/auth-required'
import { useCharacterDetailTest } from '#/hooks/character'

export const Route = createFileRoute('/characters/$id/detail-test')({
  component: CharacterDetailTestPage,
})

function CharacterDetailTestPage() {
  const { id } = Route.useParams()
  const state = useCharacterDetailTest(id)

  return (
    <AuthRequired
      title='详情测试需要登录'
      description='该功能仅角色作者可调用，请先登录。'
    >
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8'>
        <section className='space-y-3'>
          <Link
            to='/characters/$id'
            params={{ id }}
            className='inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground'
          >
            <ArrowLeft className='size-4' />
            返回角色详情
          </Link>
        </section>

        <div className='grid gap-4'>
          <CharacterDetailTestChatPanel
            character={state.character}
            auth={state.auth}
            chatMessages={state.chatMessages}
            message={state.message}
            isStreaming={state.isStreaming}
            onMessageChange={state.setMessage}
            onSend={() => {
              void state.sendDetailTest()
            }}
            onStop={state.stop}
            onExportChat={() => {
              void state.exportDetailTestChat()
            }}
            onImportChat={() => {
              void state.importDetailTestChat()
            }}
            onOpenKnowledgeBinding={() =>
              state.setKnowledgeBindingDialogOpen(true)
            }
            onDeleteSession={() => {
              void state.deleteTemporarySession()
            }}
            hasTempSession={Boolean(state.tempChatId)}
            onResetSession={state.resetTemporarySession}
            onOpenTuning={() => state.setTuningDialogOpen(true)}
          />
        </div>

        <CharacterDetailTestTuningDialog
          open={state.tuningDialogOpen}
          onOpenChange={state.setTuningDialogOpen}
          character={state.character}
          systemPromptDraft={state.systemPromptDraft}
          onSystemPromptDraftChange={state.setSystemPromptDraft}
          temperatureInput={state.temperatureInput}
          onTemperatureInputChange={state.setTemperatureInput}
          topPInput={state.topPInput}
          onTopPInputChange={state.setTopPInput}
          maxTokensInput={state.maxTokensInput}
          onMaxTokensInputChange={state.setMaxTokensInput}
          presencePenaltyInput={state.presencePenaltyInput}
          onPresencePenaltyInputChange={state.setPresencePenaltyInput}
          frequencyPenaltyInput={state.frequencyPenaltyInput}
          onFrequencyPenaltyInputChange={state.setFrequencyPenaltyInput}
          isStreaming={state.isStreaming}
          isSyncingSessionParams={state.isSyncingSessionParams}
          hasPendingSessionParamChanges={state.hasPendingSessionParamChanges}
          tempChatId={state.tempChatId}
          appliedParams={state.appliedParams}
          isSavingTuning={state.isSavingTuning}
          onSaveTuning={state.handleSaveTuning}
        />

        <CharacterKnowledgeBindingDialog
          open={state.knowledgeBindingDialogOpen}
          onOpenChange={state.setKnowledgeBindingDialogOpen}
          linkedKnowledgeBases={state.linkedKnowledgeBases}
          availableKnowledgeBases={state.availableKnowledgeBases}
          isMutating={state.isKnowledgeBindingMutating}
          onToggleBinding={state.toggleKnowledgeBaseBinding}
        />
      </div>
    </AuthRequired>
  )
}
