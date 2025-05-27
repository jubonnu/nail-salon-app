<template>
  <div class="min-h-screen bg-primary-light">
    <header class="bg-white shadow-sm py-4 px-4">
      <div class="container mx-auto flex justify-center items-center">
        <img src="/images/logo.svg" alt="Nail Salon Logo" class="h-10 w-auto" />
        <span class="ml-2 text-lg font-semibold text-primary">NailPro</span>
      </div>
    </header>
    
    <main class="container mx-auto p-4 max-w-md">
      <slot />
    </main>
    
    <footer class="bg-white py-4 text-center text-sm text-gray-500">
      <p>© {{ new Date().getFullYear() }} NailPro. All rights reserved.</p>
    </footer>
  </div>
</template>