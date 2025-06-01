@@ .. @@
   state: () => ({
     posts: [],
     scheduledPosts: [],
-    loading: false,
-    error: null,
-    lastFetch: null
+    loading: false, 
+    error: null
   }),
 
   getters: {
     sortedPosts: (state) => {
-      const allPosts = [...state.posts, ...state.scheduledPosts];
-      return allPosts.filter(post => post && post.image_url).sort((a, b) => {
+      return [...state.posts, ...state.scheduledPosts].sort((a, b) => {
         return new Date(b.created_at) - new Date(a.created_at);
       });
     }
@@ .. @@
     async fetchPosts() {
       this.loading = true;
       try {
-        // Prevent duplicate fetches within 30 seconds
-        if (this.lastFetch && (Date.now() - this.lastFetch) < 30000) {
-          return;
-        }
-
         const { data: allPosts, error } = await supabase
           .from('instagram_posts')
           .select('*')
-          .eq('status', 'draft')
+          .neq('status', 'scheduled')
           .order('created_at', { ascending: false });
 
         if (error) throw error;
         this.posts = allPosts || [];
-        this.lastFetch = Date.now();
         return this.posts;
       } catch (error) {
         this.error = error.message;
@@ .. @@
     async fetchScheduledPosts() {
       this.loading = true;
       try {
-        // Prevent duplicate fetches within 30 seconds
-        if (this.lastFetch && (Date.now() - this.lastFetch) < 30000) {
-          return;
-        }
-
         const now = dayjs();
         // Get scheduled posts from today onwards
         const { data, error } = await supabase
@@ -          .order('scheduled_time');
 
         if (error) throw error;
         this.scheduledPosts = data || [];
-        this.lastFetch = Date.now();
         return this.scheduledPosts;
       } catch (error) {
         this.error = error.message;