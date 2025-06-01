import { defineStore } from 'pinia';
import { supabase } from '~/plugins/api';
import dayjs from 'dayjs';

export const useInstagramStore = defineStore('instagram', {
  state: () => ({
    posts: [],
    scheduledPosts: [],
    loading: false,
    error: null
  }),

  getters: {
    sortedPosts: (state) => {
      return [...state.posts, ...state.scheduledPosts].sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
    }
  },

  actions: {
    async fetchPosts() {
      this.loading = true;
      try {
        const { data: allPosts, error } = await supabase
          .from('instagram_posts')
          .select('*')
          .neq('status', 'scheduled')
          .order('created_at', { ascending: false });

        if (error) throw error;
        this.posts = allPosts || [];
        return this.posts;
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
        const now = dayjs();
        // Get scheduled posts from today onwards
        const { data, error } = await supabase
          .from('instagram_posts')
          .select('*')
          .eq('status', 'scheduled')
          .gte('scheduled_time', now.startOf('day').toISOString())
          .order('scheduled_time');

        if (error) throw error;
        this.scheduledPosts = data || [];
        return this.scheduledPosts;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});