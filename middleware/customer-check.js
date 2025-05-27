export default defineNuxtRouteMiddleware((to) => {
  // Only for customer routes
  if (to.path.startsWith('/customer/counseling')) {
    // Check if salon ID is stored (from QR scan)
    const salonId = localStorage.getItem('salonId');
    
    if (!salonId && to.path !== '/customer/scan') {
      // Redirect to scan page if no salon ID is found
      return navigateTo('/customer/scan');
    }
  }
});