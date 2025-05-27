<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-primary-light">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-secondary mb-2">NailPro 管理システム</h1>
      <p class="text-gray-600">ご利用になるインターフェースを選択してください</p>
    </div>
    
    <div class="flex flex-col md:flex-row gap-6">
      <NuxtLink to="/customer/scan" class="nail-card w-64 h-64 flex flex-col items-center justify-center bg-white">
        <div class="bg-primary-light p-4 rounded-full mb-4">
          <span class="text-4xl">📱</span>
        </div>
        <h2 class="text-xl font-semibold text-primary mb-2">お客様用画面</h2>
        <p class="text-sm text-gray-600 text-center">カウンセリングシートの記入やサービスの利用</p>
      </NuxtLink>
      
      <NuxtLink to="/admin/dashboard" class="nail-card w-64 h-64 flex flex-col items-center justify-center bg-white">
        <div class="bg-secondary-light p-4 rounded-full mb-4">
          <span class="text-4xl">💻</span>
        </div>
        <h2 class="text-xl font-semibold text-secondary mb-2">管理者用画面</h2>
        <p class="text-sm text-gray-600 text-center">サロン運営、顧客管理、経営データの管理</p>
      </NuxtLink>
    </div>
  </div>
</template>