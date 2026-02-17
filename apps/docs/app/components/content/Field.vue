<template>
  <div
    class="not-prose flex items-start gap-3 py-2.5 border-b border-default last:border-0"
  >
    <div class="flex items-center gap-2 shrink-0 min-w-32">
      <code class="text-sm font-mono font-medium text-default">{{ name }}</code>
      <span v-if="required" class="text-[10px] font-bold uppercase text-red-500"
        >required</span
      >
    </div>
    <span class="text-xs font-mono text-dimmed shrink-0 pt-0.5">{{
      type
    }}</span>
    <span class="text-sm text-muted ml-auto text-right">
      <slot />
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  type: string
  required?: boolean
}>()
</script>
