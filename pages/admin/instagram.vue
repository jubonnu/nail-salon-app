<template>
  <div 
    v-loading="loading"
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    v-show="sortedPosts.length > 0"
  >
    <div 
      v-for="post in sortedPosts"
      :key="post.id"
    >
      <PostCard :post="post" />
    </div>
  </div>
</template>

<script setup>
import { useInstagramStore } from '~/stores/instagram';

const instagramStore = useInstagramStore();
const { loading, sortedPosts } = storeToRefs(instagramStore);
</script>