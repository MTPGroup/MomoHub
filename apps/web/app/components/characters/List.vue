<script setup lang="ts">
import type { CharacterResponse } from '@momohub/types'

interface Props {
  characters: CharacterResponse[]
}

defineProps<Props>()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    <CharactersCard
      v-for="character in characters"
      :key="character.id"
      :character="character"
    />
  </div>
</template>
