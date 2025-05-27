import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
  },
  
  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;
      
      try {
        // This would be an actual API call in a real implementation
        // const response = await fetch(`${apiBaseUrl}/auth/login`, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({ email, password }),
        // });
        
        // Simulate API call for demo
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
    
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
    },
    
    async checkAuth() {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      this.loading = true;
      
      try {
        // This would validate token with backend in real implementation
        // For demo, we'll just set it
        this.token = token;
        
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