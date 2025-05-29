<script setup>
// Redirect handling is now done in middleware
definePageMeta({
  middleware: ['auth']
});
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>