@@ .. @@
     <div 
-      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
       v-loading="loading"
-      v-if="sortedPosts.length > 0"
+      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
+      v-show="sortedPosts.length > 0"
     >
       <div 
         v-for="post in sortedPosts"