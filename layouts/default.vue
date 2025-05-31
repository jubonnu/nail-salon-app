<template>
  <div class="min-h-screen">
    <header v-if="isAuthenticated" class="bg-white shadow-sm py-2 px-2 sm:px-4 fixed top-0 left-0 right-0 z-20">
      <div class="container mx-auto flex justify-between items-center">
        <div class="flex items-center">
          <NuxtLink to="/admin/dashboard" class="flex items-center">
            <img src="/images/logo.svg" alt="Nail Salon Logo" class="h-8 sm:h-10 w-auto" />
            <span class="ml-2 text-base sm:text-lg font-semibold text-primary">NailPro</span>
          </NuxtLink>
        </div>
        <div class="flex items-center">
          <el-dropdown>
            <span class="flex items-center cursor-pointer">
              <img src="/images/avatar.svg" alt="User" class="h-6 w-6 sm:h-8 sm:w-8 rounded-full" />
              <span class="ml-2 hidden md:inline">{{ authStore.user?.name || '管理者' }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>プロフィール</el-dropdown-item>
                <el-dropdown-item>設定</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">ログアウト</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>
    
    <div class="pt-14 min-h-screen">
      <div class="flex min-h-screen">
        <!-- 管理者サイドバーナビゲーション -->
        <aside v-if="isAuthenticated"
          class="bg-secondary text-white fixed left-0 top-14 bottom-0 overflow-y-auto z-10 transition-all duration-300"
          :class="{
            'w-16 sm:w-20': sidebarCollapsed,
            'w-48 sm:w-64': !sidebarCollapsed,
            '-translate-x-full md:translate-x-0': isMobileSidebarHidden
          }"
        >
          <nav class="p-4 relative">
            <button
              class="bg-secondary text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md hover:bg-secondary-dark transition-colors duration-150 float-right mb-4"
              @click="toggleSidebar"
              type="button"
            >
              <el-icon :class="{ 'transform rotate-180': sidebarCollapsed }">
                <ArrowLeft />
              </el-icon>
            </button>

            <div class="mb-8">
              <p class="text-xs uppercase text-gray-400 mb-2 clear-both" :class="{ 'text-center': sidebarCollapsed, 'opacity-0': sidebarCollapsed }">
                メイン
              </p>
              <NuxtLink to="/admin/dashboard" class="sidebar-link" :class="{ 'justify-center': sidebarCollapsed }">
                <el-icon class="icon"><DataLine /></el-icon>
                <span :class="{ 'hidden': sidebarCollapsed }">ダッシュボード</span>
              </NuxtLink>
              <NuxtLink to="/admin/customers" class="sidebar-link" :class="{ 'justify-center': sidebarCollapsed }">
                <el-icon class="icon"><User /></el-icon>
                <span :class="{ 'hidden': sidebarCollapsed }">顧客管理</span>
              </NuxtLink>
              <NuxtLink to="/admin/counseling" class="sidebar-link" :class="{ 'justify-center': sidebarCollapsed }">
                <el-icon class="icon"><Document /></el-icon>
                <span :class="{ 'hidden': sidebarCollapsed }">カウンセリングシート</span>
              </NuxtLink>
            </div>
            
            <div class="mb-8">
              <p class="text-xs uppercase text-gray-400 mb-2" :class="{ 'text-center': sidebarCollapsed, 'opacity-0': sidebarCollapsed }">
                ビジネス
              </p>
              <NuxtLink to="/admin/sales" class="sidebar-link" :class="{ 'justify-center': sidebarCollapsed }">
                <el-icon class="icon"><Money /></el-icon>
                <span :class="{ 'hidden': sidebarCollapsed }">売上・レポート</span>
              </NuxtLink>
              <NuxtLink to="/admin/instagram" class="sidebar-link" :class="{ 'justify-center': sidebarCollapsed }">
                <el-icon class="icon"><Picture /></el-icon>
                <span :class="{ 'hidden': sidebarCollapsed }">Instagram投稿</span>
              </NuxtLink>
            </div>
            
            <div class="mb-8">
              <p class="text-xs uppercase text-gray-400 mb-2" :class="{ 'text-center': sidebarCollapsed, 'opacity-0': sidebarCollapsed }">
                オプション
              </p>
              <NuxtLink to="/admin/reservations" class="sidebar-link" :class="{ 'justify-center': sidebarCollapsed }">
                <el-icon class="icon"><Calendar /></el-icon>
                <span :class="{ 'hidden': sidebarCollapsed }">予約管理</span>
              </NuxtLink>
              <NuxtLink to="/admin/staff" class="sidebar-link" :class="{ 'justify-center': sidebarCollapsed }">
                <el-icon class="icon"><UserFilled /></el-icon>
                <span :class="{ 'hidden': sidebarCollapsed }">スタッフ管理</span>
              </NuxtLink>
              <NuxtLink to="/admin/inventory" class="sidebar-link" :class="{ 'justify-center': sidebarCollapsed }">
                <el-icon class="icon"><Box /></el-icon>
                <span :class="{ 'hidden': sidebarCollapsed }">在庫管理</span>
              </NuxtLink>
            </div>
          </nav>
        </aside>
        
        <!-- サイドバーオーバーレイ -->
        <div
          v-if="!isMobileSidebarHidden"
          class="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden"
          @click="toggleMobileSidebar"
        ></div>
        
        <!-- モバイル用ナビゲーションバー -->
        <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-up z-10">
          <div class="flex justify-around py-2">
            <NuxtLink to="/admin/dashboard" class="flex flex-col items-center p-2">
              <span class="icon"><i class="el-icon-data-line"></i></span>
              <span class="text-xs">ダッシュボード</span>
            </NuxtLink>
            <NuxtLink to="/admin/customers" class="flex flex-col items-center p-2">
              <span class="icon"><i class="el-icon-user"></i></span>
              <span class="text-xs">顧客</span>
            </NuxtLink>
            <NuxtLink to="/admin/counseling" class="flex flex-col items-center p-2">
              <span class="icon"><i class="el-icon-document"></i></span>
              <span class="text-xs">カウンセリング</span>
            </NuxtLink>
            <NuxtLink to="/admin/sales" class="flex flex-col items-center p-2">
              <span class="icon"><i class="el-icon-money"></i></span>
              <span class="text-xs">売上</span>
            </NuxtLink>
          </div>
        </div>
        
        <!-- メインコンテンツ -->
        <main
          class="flex-1 pb-16 md:pb-0 px-4 bg-white w-full"
          :class="[
            {
              'md:ml-20': sidebarCollapsed,
              'md:ml-64': !sidebarCollapsed
            },
            'transition-[margin] duration-300 ease-in-out'
          ]"
        >
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useLocalStorage, useWindowSize } from '@vueuse/core';
import {
  ArrowLeft,
  Menu,
  DataLine,
  User,
  Document,
  Money,
  Picture,
  Calendar,
  UserFilled,
  Box
} from '@element-plus/icons-vue';

const route = useRoute();
const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isMobileSidebarHidden = ref(true);
const sidebarCollapsed = useLocalStorage('sidebarCollapsed', false);
const { width } = useWindowSize();

const toggleMobileSidebar = () => {
  isMobileSidebarHidden.value = !isMobileSidebarHidden.value;
};

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
  window.dispatchEvent(new Event('resize')); // Trigger resize event for any responsive components
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    ElMessage.success('ログアウトしました');
    await navigateTo('/login');
  } catch (error) {
    ElMessage.error('ログアウトに失敗しました');
  }
};

// Auto-collapse sidebar on small screens
watch(width, (newWidth) => {
  if (newWidth < 768) { // md breakpoint
    sidebarCollapsed.value = true;
  }
};
</script>

<style scoped>
.sidebar-link {
  @apply flex items-center justify-start py-2 px-2 sm:px-4 rounded-md hover:bg-secondary-light hover:text-white transition-colors duration-150 mb-1 text-sm sm:text-base;
}

.sidebar-link .icon {
  @apply flex-shrink-0 text-lg sm:text-xl;
}

.sidebar-link:not(.justify-center) .icon {
  @apply mr-3;
}

.sidebar-link.router-link-active {
  @apply bg-primary text-secondary font-medium;
}

.sidebar-link .icon {
  @apply text-primary;
}

.sidebar-link:hover .icon {
  @apply text-white;
}

.sidebar-link.router-link-active .icon {
  @apply text-secondary;
}

.icon {
  @apply flex-shrink-0 text-lg sm:text-xl;
}

.shadow-up {
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
}
</style>