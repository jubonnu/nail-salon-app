<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-primary-light">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-secondary mb-2">NailPro</h1>
      <p class="text-gray-600">ネイルサロン管理システム</p>
    </div>
    
    <div class="flex flex-col items-center">
      <NuxtLink to="/admin/dashboard" class="nail-card w-64 h-48 flex flex-col items-center justify-center bg-white">
        <div class="bg-secondary-light p-4 rounded-full mb-4">
          <span class="text-4xl">💻</span>
        </div>
        <h2 class="text-xl font-semibold text-secondary mb-2">管理画面へ</h2>
        <p class="text-sm text-gray-600 text-center">サロン運営、顧客管理、経営データの管理</p>
      </NuxtLink>
    </div>
  </div>
</template>