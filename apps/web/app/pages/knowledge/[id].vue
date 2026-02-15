<script setup lang="ts">
import type { KnowledgeBaseResponse, KnowledgeFileResponse } from '~/types'
import { getApiErrorMessage } from '~/types'

const route = useRoute()
const knowledgeBaseId = route.params.id as string

const { getKnowledgeBase, listFiles, deleteFile, deleteKnowledgeBase } = useKnowledge()
const authStore = useAuthStore()

const knowledgeBase = ref<KnowledgeBaseResponse | null>(null)
const files = ref<KnowledgeFileResponse[]>([])
const loading = ref(true)
const error = ref('')

const fetchData = async () => {
  try {
    const [kbResponse, filesResponse] = await Promise.all([
      getKnowledgeBase(knowledgeBaseId),
      listFiles(knowledgeBaseId)
    ])
    if (kbResponse.success && kbResponse.data) {
      knowledgeBase.value = kbResponse.data
    }
    if (filesResponse.success && filesResponse.data) {
      files.value = filesResponse.data
    }
  } catch (e) {
    error.value = getApiErrorMessage(e, '加载知识库失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

const isOwner = computed(() => {
  return authStore.user && knowledgeBase.value && authStore.user.userId === knowledgeBase.value.authorId
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const statusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'success'
    case 'PROCESSING': return 'warning'
    case 'PENDING': return 'info'
    case 'FAILED': return 'error'
    default: return 'neutral'
  }
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'COMPLETED': return '已完成'
    case 'PROCESSING': return '处理中'
    case 'PENDING': return '等待中'
    case 'FAILED': return '失败'
    default: return status
  }
}

const handleDeleteFile = async (fileId: string) => {
  if (!confirm('确定要删除这个文件吗？')) return
  try {
    await deleteFile(knowledgeBaseId, fileId)
    files.value = files.value.filter(f => f.id !== fileId)
  } catch (e) {
    error.value = getApiErrorMessage(e, '删除文件失败')
  }
}

const handleDelete = async () => {
  if (!confirm('确定要删除这个知识库吗？所有文件将被删除。')) return
  try {
    await deleteKnowledgeBase(knowledgeBaseId)
    navigateTo('/knowledge')
  } catch (e) {
    error.value = getApiErrorMessage(e, '删除失败')
  }
}

const handleFileUploaded = () => {
  listFiles(knowledgeBaseId).then((response) => {
    if (response.success && response.data) {
      files.value = response.data
    }
  })
}
</script>

<template>
  <UContainer class="py-8">
    <UButton
      to="/knowledge"
      variant="ghost"
      icon="i-lucide-arrow-left"
      class="mb-6"
    >
      返回列表
    </UButton>

    <!-- 加载状态 -->
    <div v-if="loading">
      <UCard>
        <div class="space-y-3">
          <USkeleton class="h-6 w-1/3" />
          <USkeleton class="h-4 w-2/3" />
        </div>
      </UCard>
    </div>

    <!-- 错误状态 -->
    <UAlert
      v-else-if="error && !knowledgeBase"
      color="error"
      :title="error"
      icon="i-lucide-alert-circle"
    />

    <!-- 知识库详情 -->
    <div
      v-else-if="knowledgeBase"
      class="space-y-6"
    >
      <!-- 基本信息 -->
      <UCard>
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ knowledgeBase.name }}
            </h1>
            <p class="text-gray-500 mt-1">
              {{ knowledgeBase.description || '暂无描述' }}
            </p>
            <div class="flex items-center gap-3 mt-3">
              <UBadge
                :color="knowledgeBase.isPublic ? 'success' : 'neutral'"
                variant="subtle"
              >
                {{ knowledgeBase.isPublic ? '公开' : '私密' }}
              </UBadge>
              <span class="text-xs text-gray-400">
                创建于 {{ formatDate(knowledgeBase.createdAt) }}
              </span>
            </div>
          </div>
          <div
            v-if="isOwner"
            class="flex gap-2"
          >
            <UButton
              variant="ghost"
              color="error"
              icon="i-lucide-trash-2"
              size="sm"
              @click="handleDelete"
            >
              删除
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- 文件上传 -->
      <UCard v-if="isOwner">
        <template #header>
          <h2 class="text-lg font-semibold">
            上传文件
          </h2>
        </template>
        <KnowledgeFileUploader
          :knowledge-base-id="knowledgeBaseId"
          @uploaded="handleFileUploaded"
        />
      </UCard>

      <!-- 错误提示 -->
      <UAlert
        v-if="error"
        color="error"
        :title="error"
        icon="i-lucide-alert-circle"
      />

      <!-- 文件列表 -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">
            文件列表 ({{ files.length }})
          </h2>
        </template>

        <div
          v-if="files.length === 0"
          class="text-center py-8"
        >
          <UIcon
            name="i-lucide-file-x"
            class="text-4xl text-gray-300 mx-auto mb-3"
          />
          <p class="text-gray-500">
            还没有文件
          </p>
        </div>

        <div
          v-else
          class="divide-y divide-gray-200 dark:divide-gray-700"
        >
          <div
            v-for="file in files"
            :key="file.id"
            class="flex items-center justify-between py-3"
          >
            <div class="flex items-center gap-3 min-w-0">
              <UIcon
                name="i-lucide-file-text"
                class="text-lg text-gray-400 shrink-0"
              />
              <div class="min-w-0">
                <p class="font-medium truncate">
                  {{ file.fileName }}
                </p>
                <div class="flex items-center gap-2 text-xs text-gray-400">
                  <span>{{ formatFileSize(file.fileSize) }}</span>
                  <UBadge
                    :color="statusColor(file.status)"
                    size="xs"
                    variant="subtle"
                  >
                    {{ statusLabel(file.status) }}
                  </UBadge>
                </div>
              </div>
            </div>
            <UButton
              v-if="isOwner"
              variant="ghost"
              color="error"
              icon="i-lucide-trash-2"
              size="xs"
              @click="handleDeleteFile(file.id)"
            />
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
