<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <img src="/images/logo.svg" alt="Logo" class="mx-auto h-12 sm:h-16 w-auto transform hover:scale-105 transition-transform duration-300" />
        <h2 class="mt-6 text-center text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          アカウントにログイン
        </h2>
      </div>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="mt-8 space-y-6"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="email">
          <el-input
            v-model="form.email"
            type="email"
            autocomplete="email"
            placeholder="メールアドレス"
            class="appearance-none rounded-t-lg relative block w-full border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm bg-white/50"
          />
        </el-form-item>
          
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            placeholder="パスワード"
            class="appearance-none rounded-b-lg relative block w-full border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm bg-white/50"
            show-password
          />
        </el-form-item>

        <div class="flex items-center justify-between">
          <el-checkbox v-model="rememberMe">ログイン状態を保持</el-checkbox>
          <NuxtLink to="/forgot-password" class="text-xs sm:text-sm text-primary hover:text-primary-dark">
            パスワードをお忘れの方
          </NuxtLink>
        </div>

        <div>
          <el-button
            type="primary"
            native-type="submit"
            class="w-full py-3 text-base font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            :loading="loading"
          >
            ログイン
          </el-button>
        </div>
      </el-form>

      <div class="text-center">
        <p class="text-sm text-gray-600">
          アカウントをお持ちでない方は
          <NuxtLink to="/register" class="text-primary hover:text-primary-dark">
            新規登録
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  layout: 'auth',
  middleware: ['guest']
});

const route = useRoute();
const router = useRouter()
const authStore = useAuthStore();
const formRef = ref(null);
const loading = ref(false);
const rememberMe = ref(false);

const form = reactive({
  email: '',
  password: ''
});

const rules = {
  email: [
    { required: true, message: 'メールアドレスを入力してください', trigger: 'blur' },
    { type: 'email', message: '有効なメールアドレスを入力してください', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'パスワードを入力してください', trigger: 'blur' },
    { min: 8, message: 'パスワードは8文字以上で入力してください', trigger: 'blur' }
  ]
};

const handleLogin = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    loading.value = true;
    
    authStore.rememberMe = rememberMe.value;
    const success = await authStore.login(form.email, form.password);
    if (success) {
      ElMessage.success('ログインしました');
      await navigateTo('/admin/dashboard')
    }
  } catch (error) {
    ElMessage.error('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
  } finally {
    loading.value = false;
  }
}
</script>