<template>
  <USeparator />

  <UFooter>
    <template #left>
      <p class="text-sm text-muted">
        Copyright © {{ new Date().getFullYear() }} MTP Group -
        <ULink
          to="https://github.com/MTPGroup/MomoHub/blob/master/LICENSE"
          target="_blank"
          class="hover:underline"
        >
          MIT License
        </ULink>
      </p>
    </template>

    <template #right>
      <UButton
        to="https://github.com/MTPGroup/MomoHub"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="GitHub"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>
