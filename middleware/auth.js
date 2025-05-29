export default defineNuxtRouteMiddleware(async (to) => {
  // Skip auth check for auth-related routes
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  if (publicRoutes.includes(to.path)) {
    return;
  }
  
  const authStore = useAuthStore();
  
  // Handle root path redirect
  if (to.path === '/') {
    return navigateTo(authStore.isAuthenticated ? '/admin/dashboard' : '/login');
  }
  
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