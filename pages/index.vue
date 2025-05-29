<script setup>
// Redirect to login page
const router = useRouter();

// Only redirect on client-side
onMounted(() => {
  router.push('/login');
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <el-spinner />
  </div>
</template>