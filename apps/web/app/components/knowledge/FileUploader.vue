<script setup lang="ts">
import { getApiErrorMessage } from '@momohub/types'

interface Props {
  knowledgeBaseId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  uploaded: []
}>()

const { uploadFile } = useKnowledge()

const uploading = ref(false)
const error = ref('')
const fileInput = ref<HTMLInputElement>()

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files?.length) return

  uploading.value = true
  error.value = ''

  try {
    for (const file of files) {
      await uploadFile(props.knowledgeBaseId, file)
    }
    emit('uploaded')
  } catch (e) {
    error.value = getApiErrorMessage(e, '上传失败')
  } finally {
    uploading.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const triggerFileSelect = () => {
  fileInput.value?.click()
}
</script>

<template>
  <div>
    <input
      ref="fileInput"
      type="file"
      multiple
      class="hidden"
      accept=".txt,.md,.pdf,.doc,.docx"
      @change="handleFileSelect"
    />
    <div
      class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
      @click="triggerFileSelect"
    >
      <UIcon
        name="i-lucide-upload"
        class="text-4xl text-gray-400 mx-auto mb-3"
      />
      <p class="text-gray-600 dark:text-gray-400">
        {{ uploading ? '上传中...' : '点击或拖拽文件到此处上传' }}
      </p>
      <p class="text-xs text-gray-400 mt-1">
        支持 TXT、MD、PDF、DOC、DOCX 格式
      </p>
    </div>

    <UAlert
      v-if="error"
      color="error"
      :title="error"
      icon="i-lucide-alert-circle"
      class="mt-4"
    />
  </div>
</template>
