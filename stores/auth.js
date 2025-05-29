import { defineStore } from 'pinia';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null,
    rememberMe: false
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
  },
  
  actions: {
    async register(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
            }
          ]);

        if (profileError) throw profileError;

        return true;
      } catch (error) {
        this.error = error.message || 'Registration failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        // Get user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        this.user = {
          id: data.user.id,
          email: data.user.email,
          name: profile?.name || '管理者',
          role: 'admin'
        };
        this.token = data.session.access_token;

        localStorage.setItem('token', this.token);
        localStorage.setItem('rememberMe', this.rememberMe);

        return true;
      } catch (error) {
        this.error = error.message || 'Authentication failed';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async logout() {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Logout error:', error);
      }

      // Clear session data
      this.user = null;
      this.token = null;
      this.rememberMe = false;
      localStorage.removeItem('token');
      localStorage.removeItem('rememberMe');
      
      // Clear navigation history to prevent back navigation
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', window.location.href);
        window.onpopstate = () => {
          window.history.pushState(null, '', window.location.href);
        };
      }
    },
    
    async checkAuth() {
      const token = localStorage.getItem('token');
      const rememberMe = localStorage.getItem('rememberMe') === 'true';

      if (!token || !rememberMe) {
        this.logout();
        return false;
      }

      this.loading = true;

      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          throw new Error('Invalid session');
        }

        // Get user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        this.user = {
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || '管理者',
          role: 'admin'
        };
        this.token = session.access_token;
        this.rememberMe = rememberMe;

        return true;
      } catch (error) {
        this.logout();
        return false;
      } finally {
        this.loading = false;
      }
    }
  }
});