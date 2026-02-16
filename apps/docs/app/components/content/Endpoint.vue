<template>
  <div class="not-prose my-4 rounded-xl border border-default overflow-hidden">
    <div class="flex items-center gap-3 px-4 py-3 bg-elevated">
      <span
        class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide"
        :class="methodClass"
      >
        {{ method }}
      </span>
      <code class="text-sm font-mono text-default">{{ path }}</code>
      <span
        v-if="auth"
        class="ml-auto inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400"
      >
        <UIcon name="i-lucide-lock" class="size-3" />
        Auth
      </span>
    </div>
    <div class="px-4 py-3 text-sm text-muted">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  method: string
  path: string
  auth?: boolean
}>()

const methodColors: Record<string, string> = {
  GET: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  PATCH:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
}

const methodClass = computed(
  () => methodColors[props.method.toUpperCase()] || methodColors.GET,
)
</script>
