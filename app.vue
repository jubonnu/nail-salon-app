<template>
  <div class="min-h-screen">
    <NuxtLayout :name="layout">
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const layout = computed(() => {
  // Use auth layout for login, register, and forgot-password pages
  if (['/login', '/register', '/forgot-password'].includes(route.path)) {
    return 'auth';
  }
  return 'default';
});
</script>