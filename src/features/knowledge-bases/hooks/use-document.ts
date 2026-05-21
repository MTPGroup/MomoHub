import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { useDebounceValue } from 'usehooks-ts'
import type { KnowledgeDocumentOut } from '#/client'
import {
  deleteDocumentMutation,
  getKbQueryKey,
  listDocumentsOptions,
  listDocumentsQueryKey,
  listKbsQueryKey,
  retryDocumentMutation,
  uploadDocumentMutation,
} from '#/client/@tanstack/react-query.gen'
import { isDocumentProcessing, normalizeDocumentStatus } from '../utils'

const DOCUMENT_POLL_INTERVAL_MS = 4000

export function useDocument({
  kbId,
  enabled,
}: {
  kbId: string
  enabled: boolean
}) {
  const queryClient = useQueryClient()

  const [deleteFailedDocId, setDeleteFailedDocId] = useState<string | null>(
    null,
  )

  const documentsQuery = useQuery({
    ...listDocumentsOptions({
      path: { id: kbId },
    }),
    enabled,
    placeholderData: (previousData) => previousData,
    refetchInterval: (query) => {
      const docs =
        (query.state.data?.data as KnowledgeDocumentOut[] | null | undefined) ??
        []
      return docs.some((doc) =>
        isDocumentProcessing(normalizeDocumentStatus(doc.status)),
      )
        ? DOCUMENT_POLL_INTERVAL_MS
        : false
    },
  })

  const documents =
    (documentsQuery.data?.data as KnowledgeDocumentOut[] | null | undefined) ??
    []

  const [showPollingHint] = useDebounceValue(
    documentsQuery.isFetching && documents.length > 0,
    300,
  )

  const uploadDocument = useMutation({
    ...uploadDocumentMutation(),
    onSuccess: (res) => {
      const doc = res.data
      toast.success('文档已提交处理队列', {
        description: doc
          ? `${doc.fileName}（状态：${doc.status}）`
          : '请稍后查看文档处理状态',
      })
      queryClient.invalidateQueries({
        queryKey: getKbQueryKey({ path: { id: kbId } }),
      })
      queryClient.invalidateQueries({
        queryKey: listDocumentsQueryKey({ path: { id: kbId } }),
      })
      queryClient.invalidateQueries({ queryKey: listKbsQueryKey() })
    },
    onError: (error) => {
      toast.error('上传失败', { description: error.message || '请稍后重试' })
    },
  })

  const handleUpload = (file?: File | null) => {
    if (!file) {
      return
    }
    uploadDocument.mutate({
      path: { id: kbId },
      body: { file },
    })
  }

  const retryDocument = useMutation({
    ...retryDocumentMutation(),
    onSuccess: () => {
      toast.success('已重新提交文档处理', {
        description: '请稍后刷新查看最新状态',
      })
      queryClient.invalidateQueries({
        queryKey: listDocumentsQueryKey({ path: { id: kbId } }),
      })
    },
    onError: (error) => {
      toast.error('重试失败', { description: error.message || '请稍后重试' })
    },
  })

  const handleRetry = (documentId: string) => {
    retryDocument.mutate({
      path: { id: kbId, doc_id: documentId },
    })
  }

  const deleteDocument = useMutation({
    ...deleteDocumentMutation(),
    onSuccess: () => {
      setDeleteFailedDocId(null)
      toast.success('文档已删除')
      queryClient.invalidateQueries({
        queryKey: listDocumentsQueryKey({ path: { id: kbId } }),
      })
      queryClient.invalidateQueries({
        queryKey: getKbQueryKey({ path: { id: kbId } }),
      })
      queryClient.invalidateQueries({ queryKey: listKbsQueryKey() })
    },
    onError: (error, variables) => {
      setDeleteFailedDocId(variables.path.doc_id)
      toast.error('删除文档失败', {
        description: error.message || '请稍后重试',
      })
    },
  })

  const handleDelete = (docId: string) => {
    setDeleteFailedDocId(null)
    deleteDocument.mutate({
      path: { id: kbId, doc_id: docId },
    })
  }

  return {
    data: {
      documents,
    },
    state: {
      showPollingHint,
      deleteFailedDocId,
      isDeleting: deleteDocument.isPending,
      isRetrying: retryDocument.isPending,
    },
    actions: {
      retry: handleRetry,
      delete: handleDelete,
      upload: handleUpload,
      setDeleteFailedDocId,
    },
  }
}

export type DocumentStates = ReturnType<typeof useDocument>
