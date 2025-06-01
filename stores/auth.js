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

        if (error) {
          if (error.message === 'User already registered') {
            throw new Error('このメールアドレスは既に登録されています。ログインしてください。');
          }
          throw error;
        }

        // Wait a moment for the auth user to be fully created
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email
            }
          ])
          .select();

        if (profileError) throw profileError;

        return { success: true };
      } catch (error) {
        this.error = error.message || 'Registration failed';
        return { success: false, error: this.error };
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

        if (error) {
          this.error = error.message;
          return { success: false, error: error.message };
        }

        // Get user profile
        let { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id);

        // If no profile exists, create one
        if (!profile || profile.length === 0) {
          const { data: newProfile, error: profileError } = await supabase
            .from('users')
            .insert([
              {
                id: data.user.id,
                email: data.user.email
              }
            ])
            .select();

          if (profileError) {
            this.error = profileError.message;
            return { success: false, error: profileError.message };
          }
          profile = newProfile;
        }

        this.user = {
          id: data.user.id,
          email: data.user.email,
          name: profile[0]?.name || '管理者',
          role: 'admin'
        };
        this.token = data.session.access_token;

        localStorage.setItem('token', this.token);
        localStorage.setItem('rememberMe', this.rememberMe);

        return { success: true };
      } catch (error) {
        this.error = error.message || 'Authentication failed';
        return { success: false, error: this.error };
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
        let { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id);

        // If no profile exists, create one
        if (!profile || profile.length === 0) {
          const { data: newProfile, error: profileError } = await supabase
            .from('users')
            .insert([
              {
                id: session.user.id,
                email: session.user.email
              }
            ])
            .select();

          if (profileError) throw profileError;
          profile = newProfile;
        }

        this.user = {
          id: session.user.id,
          email: session.user.email,
          name: profile[0]?.name || '管理者',
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