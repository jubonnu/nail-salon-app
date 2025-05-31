<template>
  <div class="max-w-md w-full mx-4">
    <div class="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl space-y-8">
      <div>
        <img src="/images/logo.svg" alt="Logo" class="mx-auto h-12 sm:h-16 w-auto transform hover:scale-105 transition-transform duration-300" />
        <h2 class="mt-6 text-center text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          パスワードをリセット
        </h2>
        <p class="mt-4 text-center text-sm text-gray-600 leading-relaxed">
          登録したメールアドレスを入力してください。<br>
          パスワードリセット用のリンクをお送りします。
        </p>
      </div>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="mt-8 space-y-8"
        @submit.prevent="handleSubmit"
      >
        <el-form-item prop="email">
          <el-input
            v-model="form.email"
            type="email"
            autocomplete="email"
            placeholder="メールアドレス"
            size="large"
          />
        </el-form-item>

        <div>
          <el-button
            type="primary"
            native-type="submit"
            class="w-full text-base font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            size="large"
            :loading="loading"
          >
            リセットリンクを送信
          </el-button>
        </div>

        <div class="text-center">
          <NuxtLink to="/login" class="text-sm text-primary hover:text-primary-dark">
            ログイン画面に戻る
          </NuxtLink>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

definePageMeta({
  layout: 'auth',
  middleware: ['guest']
});

const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  email: ''
});

const rules = {
  email: [
    { required: true, message: 'メールアドレスを入力してください', trigger: 'blur' },
    { type: 'email', message: '有効なメールアドレスを入力してください', trigger: 'blur' }
  ]
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    loading.value = true;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    ElMessage.success('パスワードリセット用のメールを送信しました');
    form.email = '';
  } catch (error) {
    ElMessage.error('メール送信に失敗しました。もう一度お試しください。');
  } finally {
    loading.value = false;
  }
};
</script>