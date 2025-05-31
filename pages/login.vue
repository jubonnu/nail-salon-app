<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-8 sm:py-12">
    <div class="max-w-md w-full space-y-8">
      <div>
        <img src="/images/logo.svg" alt="Logo" class="mx-auto h-10 sm:h-12 w-auto" />
        <h2 class="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
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
        <div class="rounded-md shadow-sm -space-y-px">
          <el-form-item prop="email">
            <el-input
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="メールアドレス"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              placeholder="パスワード"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              show-password
            />
          </el-form-item>
        </div>

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
            class="w-full"
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
  layout: 'auth'
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