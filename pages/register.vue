<template>
    <div class="max-w-md w-full mx-4">
        <div
            class="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl space-y-8"
        >
            <div>
                <img
                    src="/images/logo.svg"
                    alt="Logo"
                    class="mx-auto h-12 sm:h-16 w-auto transform hover:scale-105 transition-transform duration-300"
                />
                <h2
                    class="mt-6 text-center text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                >
                    新規アカウント登録
                </h2>
            </div>

            <el-form
                ref="formRef"
                :model="form"
                :rules="rules"
                class="mt-8 space-y-8"
                @submit.prevent="handleRegister"
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

                <el-form-item prop="name">
                    <el-input
                        v-model="form.name"
                        type="text"
                        placeholder="サロン名"
                        size="large"
                    />
                </el-form-item>

                <el-form-item prop="password">
                    <el-input
                        v-model="form.password"
                        type="password"
                        autocomplete="new-password"
                        placeholder="パスワード"
                        size="large"
                        show-password
                    />
                </el-form-item>

                <el-form-item prop="confirmPassword">
                    <el-input
                        v-model="form.confirmPassword"
                        type="password"
                        autocomplete="new-password"
                        placeholder="パスワード(確認用)"
                        size="large"
                        show-password
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
                        アカウントを作成
                    </el-button>
                </div>
            </el-form>

            <div class="text-center">
                <p class="text-sm text-gray-600">
                    すでにアカウントをお持ちの方は
                    <NuxtLink
                        to="/login"
                        class="text-primary hover:text-primary-dark"
                    >
                        ログイン
                    </NuxtLink>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useRouter } from "vue-router";

definePageMeta({
    layout: "auth",
    middleware: ["guest"],
});

const router = useRouter();
const authStore = useAuthStore();
const formRef = ref(null);
const loading = ref(false);

const form = reactive({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
});

const validatePassword = (rule, value, callback) => {
    if (value === "") {
        callback(new Error("パスワードを入力してください"));
    } else if (value.length < 8) {
        callback(new Error("パスワードは8文字以上で入力してください"));
    } else {
        callback();
    }
};

const validateConfirmPassword = (rule, value, callback) => {
    if (value === "") {
        callback(new Error("確認用パスワードを入力してください"));
    } else if (value !== form.password) {
        callback(new Error("パスワードが一致しません"));
    } else {
        callback();
    }
};

const rules = {
    email: [
        {
            required: true,
            message: "メールアドレスを入力してください",
            trigger: "blur",
        },
        {
            type: "email",
            message: "有効なメールアドレスを入力してください",
            trigger: "blur",
        },
    ],
    name: [
        {
            required: true,
            message: "サロン名を入力してください",
            trigger: "blur",
        },
        {
            min: 2,
            message: "サロン名は2文字以上で入力してください",
            trigger: "blur",
        },
    ],
    password: [
        { required: true, validator: validatePassword, trigger: "blur" },
    ],
    confirmPassword: [
        { required: true, validator: validateConfirmPassword, trigger: "blur" },
    ],
};

const handleRegister = async () => {
    if (!formRef.value) return;

    try {
        await formRef.value.validate();
        loading.value = true;

        // Register user
        await authStore.register(form.email, form.password, form.name);

        // Auto login after registration
        const success = await authStore.login(form.email, form.password);
        if (success) {
            ElMessage.success("アカウントを作成しました");
            router.push("/admin/dashboard");
        }
    } catch (error) {
        if (error.message.includes("既に登録されています")) {
            ElMessage({
                message: error.message,
                type: "warning",
                duration: 5000,
            });
            router.push("/login");
        } else {
            ElMessage.error(
                "アカウント作成に失敗しました。もう一度お試しください。"
            );
        }
    } finally {
        loading.value = false;
    }
};

// Redirect if already logged in
if (process.client) {
    const auth = useAuthStore();
    if (auth.isAuthenticated) {
        router.push("/admin/dashboard");
    }
}
</script>
