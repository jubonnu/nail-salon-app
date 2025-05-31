<script setup>
defineProps({
  name: {
    type: String,
    default: 'auth'
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light via-white to-secondary-light px-4 sm:px-6 lg:px-8">
    <slot />
  </div>
</template>