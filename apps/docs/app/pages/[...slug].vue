<template>
  <div v-if="page">
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-default">
        {{ page.title }}
      </h1>
      <p v-if="page.description" class="mt-2 text-lg text-muted">
        {{ page.description }}
      </p>
    </div>
    <div class="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-h2:text-xl prose-h2:font-semibold prose-h2:border-b prose-h2:border-(--ui-border) prose-h2:pb-2 prose-h2:mt-10 prose-h3:text-lg prose-h3:mt-6 prose-pre:bg-(--ui-bg-elevated) prose-pre:border prose-pre:border-(--ui-border)">
      <ContentRenderer :value="page" />
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { data: page } = await useAsyncData(route.path, () => queryCollection('content').path(route.path).first())

if (page.value) {
  useHead({ title: `${page.value.title} - MomoHub API Docs` })
  useSeoMeta({
    title: page.value.title,
    description: page.value.description,
  })
}
</script>
