import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  bindKnowledgeBaseMutation,
  listCharacterKnowledgeBasesOptions,
  listCharacterKnowledgeBasesQueryKey,
  listKbsOptions,
  listKbsQueryKey,
  unbindKnowledgeBaseMutation,
} from '#/client/@tanstack/react-query.gen'

type UseCharacterKnowledgeBindingInput = {
  characterId: string
  isAuthenticated?: boolean
}

export function useCharacterKnowledgeBinding({
  characterId,
  isAuthenticated,
}: UseCharacterKnowledgeBindingInput) {
  const queryClient = useQueryClient()
  const enabled = isAuthenticated

  const allKnowledgeBasesQuery = useQuery({
    ...listKbsOptions({
      query: {
        page: 1,
        page_size: 100,
        mine: true,
      },
    }),
    enabled,
  })

  const linkedKnowledgeBasesQuery = useQuery({
    ...listCharacterKnowledgeBasesOptions({
      path: { id: characterId },
    }),
    enabled,
  })

  const linkedKnowledgeBases = linkedKnowledgeBasesQuery.data?.data ?? []
  const linkedKnowledgeBaseIds = new Set(
    linkedKnowledgeBases.map((kb) => kb.id),
  )
  const availableKnowledgeBases = allKnowledgeBasesQuery.data?.data?.items ?? []

  const bindKnowledgeBase = useMutation({
    ...bindKnowledgeBaseMutation(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: listCharacterKnowledgeBasesQueryKey({
            path: { id: characterId },
          }),
        }),
        queryClient.invalidateQueries({ queryKey: listKbsQueryKey() }),
      ])
      toast.success('知识库关联成功')
    },
    onError: (error) => {
      toast.error('关联知识库失败', {
        description: error.message || '请稍后重试',
      })
    },
  })

  const unbindKnowledgeBase = useMutation({
    ...unbindKnowledgeBaseMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: listCharacterKnowledgeBasesQueryKey({
          path: { id: characterId },
        }),
      })
      toast.success('已取消关联知识库')
    },
    onError: (error) => {
      toast.error('取消关联失败', {
        description: error.message || '请稍后重试',
      })
    },
  })

  const toggleKnowledgeBaseBinding = (knowledgeBaseId: string) => {
    if (!enabled) {
      toast.error('请先登录')
      return
    }
    if (linkedKnowledgeBaseIds.has(knowledgeBaseId)) {
      unbindKnowledgeBase.mutate({
        path: {
          id: characterId,
          kb_id: knowledgeBaseId,
        },
      })
      return
    }
    bindKnowledgeBase.mutate({
      path: { id: characterId },
      body: {
        knowledgeBaseId,
      },
    })
  }

  return {
    linkedKnowledgeBases,
    availableKnowledgeBases,
    toggleKnowledgeBaseBinding,
    isKnowledgeBindingMutating:
      bindKnowledgeBase.isPending || unbindKnowledgeBase.isPending,
  }
}
