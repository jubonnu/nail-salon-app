<script setup>
defineProps({
  name: {
    type: String,
    default: 'auth'
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
    <slot />
  </div>
</template>