export default defineNuxtRouteMiddleware(async (to) => {
  // Skip auth check for auth-related routes
  if (to.path === '/login' || to.path === '/register' || to.path === '/forgot-password') {
    return;
  }
  
  const authStore = useAuthStore();
  
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    // Try to restore session from localStorage
    const authenticated = await authStore.checkAuth();
    
    if (!authenticated) {
      // Redirect to login if not authenticated
      return navigateTo('/login');
    }
  }
});