import { defineStore } from 'pinia';

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
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate successful login
        if (email === 'admin@example.com' && password === 'password') {
          this.user = {
            id: 1,
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin'
          };
          this.token = 'fake-jwt-token';
          localStorage.setItem('token', this.token);
          localStorage.setItem('rememberMe', this.rememberMe);
          return true;
        } else {
          throw new Error('Invalid credentials');
        }
      } catch (error) {
        this.error = error.message || 'Authentication failed';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async logout() {
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
        // This would validate token with backend in real implementation
        // For demo, we'll just set it
        this.token = token;
        this.rememberMe = rememberMe;
        
        // Simulate fetching user data
        this.user = {
          id: 1,
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin'
        };
        
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