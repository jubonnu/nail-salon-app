import { defineStore } from 'pinia';
import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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
        const { data, error } = await supabase
          .from('instagram_posts')
          .select('*')
          .not('status', 'eq', 'scheduled')
          .order('created_at', { ascending: false });

        if (error) throw error;
        this.posts = data || [];
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
        const { data, error } = await supabase
          .from('instagram_posts')
          .select('*')
          .match({ status: 'scheduled' })
          .gte('scheduled_time', dayjs().startOf('day').toISOString())
          .order('scheduled_time');

        if (error) throw error;
        this.scheduledPosts = data || [];
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
        // Ensure required fields
        if (!data.image_url) {
          throw new Error('画像URLは必須です');
        }

        // Format data
        const postData = {
          image_url: data.image_url,
          caption: data.caption || '',
          hashtags: data.hashtags || [],
          scheduled_time: data.scheduled_time,
          status: data.scheduled_time ? 'scheduled' : 'draft'
        };

        const { data: post, error } = await supabase
          .from('instagram_posts')
          .insert([postData])
          .select()
          .single();

        if (error) throw error;

        // Add to appropriate list
        if (postData.status === 'scheduled') {
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
        // Format update data
        const updateData = {
          ...data,
          status: data.scheduled_time ? 'scheduled' : (data.status || 'draft')
        };

        const { data: updated, error } = await supabase
          .from('instagram_posts')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        // Refresh both lists to ensure correct state
        await Promise.all([
          this.fetchPosts(),
          this.fetchScheduledPosts()
        ]);

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
        await Promise.all([
          this.fetchPosts(),
          this.fetchScheduledPosts()
        ]);
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});