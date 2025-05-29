<template>
  <NuxtPage />
</template>

<script setup>
// Redirect to login if not authenticated, otherwise to dashboard
const authStore = useAuthStore()
const router = useRouter()

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  } else {
    router.push('/admin/dashboard')
  }
})
</script>