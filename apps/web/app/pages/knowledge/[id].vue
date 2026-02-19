<script setup lang="ts">
import type {
  KnowledgeBaseResponse,
  KnowledgeFileResponse,
  UpdateKnowledgeBaseRequest,
} from '@momohub/types'
import { getApiErrorMessage } from '@momohub/types'

const route = useRoute()
const knowledgeBaseId = route.params.id as string

const { getKnowledgeBase, listFiles, deleteFile, retryFile, deleteKnowledgeBase, updateKnowledgeBase } =
  useKnowledge()
const authStore = useAuthStore()
const toast = useToast()

const knowledgeBase = ref<KnowledgeBaseResponse | null>(null)
const files = ref<KnowledgeFileResponse[]>([])
const loading = ref(true)
const fetchError = ref('')

const fetchData = async () => {
  try {
    const [kbResponse, filesResponse] = await Promise.all([
      getKnowledgeBase(knowledgeBaseId),
      listFiles(knowledgeBaseId),
    ])
    if (kbResponse.success && kbResponse.data) {
      knowledgeBase.value = kbResponse.data
    }
    if (filesResponse.success && filesResponse.data) {
      files.value = filesResponse.data
    }
  } catch (e) {
    fetchError.value = getApiErrorMessage(e, '加载知识库失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

const isOwner = computed(() => {
  return (
    authStore.user &&
    knowledgeBase.value &&
    authStore.user.userId === knowledgeBase.value.authorId
  )
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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
    case 'COMPLETED':
      return 'success'
    case 'PROCESSING':
      return 'warning'
    case 'PENDING':
      return 'info'
    case 'FAILED':
      return 'error'
    default:
      return 'neutral'
  }
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return '已完成'
    case 'PROCESSING':
      return '处理中'
    case 'PENDING':
      return '等待中'
    case 'FAILED':
      return '失败'
    default:
      return status
  }
}

const retryingFileIds = ref<Set<string>>(new Set())

const handleRetryFile = async (fileId: string) => {
  retryingFileIds.value = new Set([...retryingFileIds.value, fileId])
  try {
    await retryFile(knowledgeBaseId, fileId)
    files.value = files.value.map((f) =>
      f.id === fileId ? { ...f, status: 'PENDING' } : f,
    )
    toast.add({
      title: '已重新提交嵌入任务',
      color: 'info',
      icon: 'i-lucide-refresh-cw',
    })
  } catch (e) {
    toast.add({
      title: getApiErrorMessage(e, '重试失败'),
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    const next = new Set(retryingFileIds.value)
    next.delete(fileId)
    retryingFileIds.value = next
  }
}

const handleDeleteFile = async (fileId: string) => {
  if (!confirm('确定要删除这个文件吗？')) return
  try {
    await deleteFile(knowledgeBaseId, fileId)
    files.value = files.value.filter((f) => f.id !== fileId)
    toast.add({
      title: '文件已删除',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  } catch (e) {
    toast.add({
      title: getApiErrorMessage(e, '删除文件失败'),
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  }
}

const handleDelete = async () => {
  if (!confirm('确定要删除这个知识库吗？所有文件将被删除。')) return
  try {
    await deleteKnowledgeBase(knowledgeBaseId)
    navigateTo('/knowledge')
  } catch (e) {
    toast.add({
      title: getApiErrorMessage(e, '删除失败'),
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  }
}

const handleFileUploaded = () => {
  listFiles(knowledgeBaseId).then((response) => {
    if (response.success && response.data) {
      files.value = response.data
    }
  })
}

// 编辑知识库信息
const showEditModal = ref(false)
const editLoading = ref(false)
const editForm = reactive<UpdateKnowledgeBaseRequest>({
  name: '',
  description: '',
  isPublic: true,
})

const openEditModal = () => {
  editForm.name = knowledgeBase.value?.name || ''
  editForm.description = knowledgeBase.value?.description || ''
  editForm.isPublic = knowledgeBase.value?.isPublic ?? true
  showEditModal.value = true
}

const handleUpdate = async () => {
  editLoading.value = true
  try {
    const response = await updateKnowledgeBase(knowledgeBaseId, editForm)
    if (response.success && response.data) {
      knowledgeBase.value = response.data
      showEditModal.value = false
      toast.add({
        title: '知识库信息已更新',
        color: 'success',
        icon: 'i-lucide-check-circle',
      })
    } else {
      toast.add({
        title: response.message || '更新失败',
        color: 'error',
        icon: 'i-lucide-alert-circle',
      })
    }
  } catch (e) {
    toast.add({
      title: getApiErrorMessage(e, '更新失败'),
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    editLoading.value = false
  }
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
      v-else-if="fetchError && !knowledgeBase"
      color="error"
      :title="fetchError"
      icon="i-lucide-alert-circle"
    />

    <!-- 知识库详情 -->
    <div v-else-if="knowledgeBase" class="space-y-6">
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
          <div v-if="isOwner" class="flex gap-2">
            <UButton
              variant="ghost"
              icon="i-lucide-pencil"
              size="sm"
              @click="openEditModal"
            >
              编辑
            </UButton>
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
          <h2 class="text-lg font-semibold">上传文件</h2>
        </template>
        <KnowledgeFileUploader
          :knowledge-base-id="knowledgeBaseId"
          @uploaded="handleFileUploaded"
        />
      </UCard>

      <!-- 文件列表 -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">文件列表 ({{ files.length }})</h2>
        </template>

        <div v-if="files.length === 0" class="text-center py-8">
          <UIcon
            name="i-lucide-file-x"
            class="text-4xl text-gray-300 mx-auto mb-3"
          />
          <p class="text-gray-500">还没有文件</p>
        </div>

        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
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
            <div v-if="isOwner" class="flex items-center gap-1 shrink-0">
              <UButton
                v-if="file.status === 'FAILED'"
                variant="ghost"
                color="warning"
                icon="i-lucide-refresh-cw"
                size="xs"
                :loading="retryingFileIds.has(file.id)"
                @click="handleRetryFile(file.id)"
              />
              <UButton
                variant="ghost"
                color="error"
                icon="i-lucide-trash-2"
                size="xs"
                @click="handleDeleteFile(file.id)"
              />
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- 编辑知识库弹窗 -->
    <UModal v-model:open="showEditModal">
      <template #content>
        <div class="p-6">
          <h2 class="text-xl font-bold text-center mb-6">编辑知识库</h2>
          <form class="space-y-4" @submit.prevent="handleUpdate">
            <UFormField label="知识库名称" required>
              <UInput
                v-model="editForm.name"
                placeholder="给知识库取个名字"
                icon="i-lucide-book-open"
                required
                class="w-full"
              />
            </UFormField>

            <UFormField label="描述">
              <UTextarea
                v-model="editForm.description"
                placeholder="描述这个知识库的内容..."
                :rows="3"
                class="w-full"
              />
            </UFormField>

            <UFormField label="可见性">
              <USwitch v-model="editForm.isPublic" label="公开知识库" />
              <p class="text-xs text-gray-500 mt-1">
                {{ editForm.isPublic ? '所有人都可以访问' : '仅自己可见' }}
              </p>
            </UFormField>

            <div class="flex gap-3 justify-end pt-2">
              <UButton
                variant="ghost"
                color="neutral"
                :disabled="editLoading"
                @click="showEditModal = false"
              >
                取消
              </UButton>
              <UButton type="submit" :loading="editLoading">
                保存
              </UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>
  </UContainer>
</template>
