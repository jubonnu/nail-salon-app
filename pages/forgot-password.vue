<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <img src="/images/logo.svg" alt="Logo" class="mx-auto h-12 w-auto" />
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          パスワードをリセット
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          登録したメールアドレスを入力してください。<br>
          パスワードリセット用のリンクをお送りします。
        </p>
      </div>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="mt-8 space-y-6"
        @submit.prevent="handleSubmit"
      >
        <div class="rounded-md shadow-sm">
          <el-form-item prop="email">
            <el-input
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="メールアドレス"
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
            />
          </el-form-item>
        </div>

        <div>
          <el-button
            type="primary"
            native-type="submit"
            class="w-full"
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