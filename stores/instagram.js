import { defineStore } from 'pinia';

export const useInstagramStore = defineStore('instagram', {
  state: () => ({
    posts: [],
    scheduledPosts: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchPosts() {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const data = await $api.instagram.getPosts();
        this.posts = data;
        return data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchScheduledPosts() {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const data = await $api.instagram.getScheduledPosts();
        this.scheduledPosts = data;
        return data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createPost(data) {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const post = await $api.instagram.createPost(data);
        if (post.status === 'scheduled') {
          this.scheduledPosts.unshift(post);
        } else {
          this.posts.unshift(post);
        }
        return post;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updatePost(id, data) {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const updated = await $api.instagram.updatePost(id, data);
        
        // Update in appropriate list based on status
        if (updated.status === 'scheduled') {
          const index = this.posts.findIndex(p => p.id === id);
          if (index !== -1) {
            this.posts.splice(index, 1);
          }
          this.scheduledPosts.unshift(updated);
        } else {
          const index = this.scheduledPosts.findIndex(p => p.id === id);
          if (index !== -1) {
            this.scheduledPosts.splice(index, 1);
          }
          this.posts.unshift(updated);
        }
        
        return updated;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deletePost(id) {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        await $api.instagram.deletePost(id);
        
        // Remove from both lists
        const postsIndex = this.posts.findIndex(p => p.id === id);
        if (postsIndex !== -1) {
          this.posts.splice(postsIndex, 1);
        }
        
        const scheduledIndex = this.scheduledPosts.findIndex(p => p.id === id);
        if (scheduledIndex !== -1) {
          this.scheduledPosts.splice(scheduledIndex, 1);
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});