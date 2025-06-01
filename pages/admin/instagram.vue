@@ .. @@
     <div 
       class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
       v-loading="loading"
-      v-if="sortedPosts && sortedPosts.length > 0"
+      v-if="sortedPosts.length > 0"
     >
       <div 
         v-for="post in sortedPosts" 
         :key="post.id" 
         class="bg-white rounded-lg shadow overflow-hidden"
-        v-if="post && post.image_url"
       >
         <div class="relative aspect-square">
           <img 
@@ .. @@
 const editingPost = ref(false);
 const editingPostId = ref(null);
 const fallbackImageUrl = 'https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg';
+const loadingPosts = ref(false);
 
 const loading = computed(() => instagramStore.loading);
 const error = computed(() => instagramStore.error);
@@ .. @@
 
 const loadPosts = async () => {
+  loadingPosts.value = true;
   try {
     await Promise.all([
       instagramStore.fetchPosts(),
@@ -    ]);
   } catch (e) {
     ElMessage.error('投稿の取得に失敗しました');
+  } finally {
+    loadingPosts.value = false;
   }
 };
@@ .. @@
   }
 };
 
-onMounted(loadPosts);
+onMounted(() => {
+  loadPosts();
+});