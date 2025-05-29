<template>
  <NuxtPage />
</template>

<script setup>
const router = useRouter();
const authStore = useAuthStore();

onBeforeMount(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
  } else {
    router.push('/admin/dashboard');
  }
});
</script>