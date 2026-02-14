<script setup lang="ts">
import type { KnowledgeBaseResponse } from '~/types'

interface Props {
  knowledgeBases: KnowledgeBaseResponse[]
}

defineProps<Props>()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    <KnowledgeCard
      v-for="kb in knowledgeBases"
      :key="kb.id"
      :knowledge-base="kb"
    />
  </div>
</template>
