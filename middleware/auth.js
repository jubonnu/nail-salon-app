export default defineNuxtRouteMiddleware(async (to) => {
  // Skip auth check for customer-facing routes
  if (to.path.startsWith('/customer')) {
    return;
  }
  
  // Skip auth check for login page
  if (to.path === '/login') {
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