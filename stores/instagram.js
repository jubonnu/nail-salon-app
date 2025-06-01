import { defineStore } from 'pinia';
import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrAfter);

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const validatePost = (data) => {
  if (!data.image_url) {
    throw new Error('画像URLは必須です');
  }
  return {
    image_url: data.image_url,
    caption: data.caption || '',
    hashtags: Array.isArray(data.hashtags) ? data.hashtags : [],
    scheduled_time: data.scheduled_time || null,
    status: data.scheduled_time ? 'scheduled' : 'draft'
  };
};

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
    },

    async createPost(data) {
      this.loading = true;
      try {
        const postData = validatePost(data);

        const { data: post, error } = await supabase
          .from('instagram_posts')
          .insert([postData])
          .select('*')
          .single();

        if (error) throw error;

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
        const updateData = validatePost(data);

        const { data: updated, error } = await supabase
          .from('instagram_posts')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        // Update local state
        await this.refreshPosts();

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
        const { error } = await supabase
          .from('instagram_posts')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        // Refresh both lists to ensure correct state
        await this.refreshPosts();
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async refreshPosts() {
      await Promise.all([
        this.fetchPosts(),
        this.fetchScheduledPosts()
      ]);
    }
  }
});