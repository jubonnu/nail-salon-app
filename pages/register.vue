<template>
  <div class="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
      <div>
        <img src="/images/logo.svg" alt="Logo" class="mx-auto h-12 sm:h-16 w-auto transform hover:scale-105 transition-transform duration-300" />
        <h2 class="mt-6 text-center text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          新規アカウント登録
        </h2>
      </div>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="mt-8 space-y-6"
        @submit.prevent="handleRegister"
      >
        <div class="rounded-md shadow-sm -space-y-px">
          <el-form-item prop="email">
            <el-input
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="メールアドレス"
              class="appearance-none rounded-t-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm bg-white/50"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              autocomplete="new-password"
              placeholder="パスワード"
              class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm bg-white/50"
              show-password
            />
          </el-form-item>
          
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="パスワード(確認用)"
              class="appearance-none rounded-b-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 sm:text-sm bg-white/50"
              show-password
            />
          </el-form-item>
        </div>

        <div>
          <el-button
            type="primary"
            native-type="submit"
            class="w-full py-3 text-base font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            :loading="loading"
          >
            アカウントを作成
          </el-button>
        </div>
      </el-form>

      <div class="text-center">
        <p class="text-sm text-gray-600">
          すでにアカウントをお持ちの方は
          <NuxtLink to="/login" class="text-primary hover:text-primary-dark">
            ログイン
          </NuxtLink>
        </p>
      </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';

definePageMeta({
  layout: 'auth',
  middleware: ['guest']
});

const router = useRouter();
const authStore = useAuthStore();
const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  email: '',
  password: '',
  confirmPassword: ''
});

const validatePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('パスワードを入力してください'));
  } else if (value.length < 8) {
    callback(new Error('パスワードは8文字以上で入力してください'));
  } else {
    callback();
  }
};

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('確認用パスワードを入力してください'));
  } else if (value !== form.password) {
    callback(new Error('パスワードが一致しません'));
  } else {
    callback();
  }
};

const rules = {
  email: [
    { required: true, message: 'メールアドレスを入力してください', trigger: 'blur' },
    { type: 'email', message: '有効なメールアドレスを入力してください', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
};

const handleRegister = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    loading.value = true;
    
    // Register user
    await authStore.register(form.email, form.password);
    
    // Auto login after registration
    const success = await authStore.login(form.email, form.password);
    if (success) {
      ElMessage.success('アカウントを作成しました');
      router.push('/admin/dashboard');
    }
  } catch (error) {
    if (error.message.includes('既に登録されています')) {
      ElMessage({
        message: error.message,
        type: 'warning',
        duration: 5000
      });
      router.push('/login');
    } else {
      ElMessage.error('アカウント作成に失敗しました。もう一度お試しください。');
    }
  } finally {
    loading.value = false;
  }
};

// Redirect if already logged in
if (process.client) {
  const auth = useAuthStore();
  if (auth.isAuthenticated) {
    router.push('/admin/dashboard');
  }
}
</script>