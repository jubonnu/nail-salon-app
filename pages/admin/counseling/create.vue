<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">カウンセリングシート作成</h1>
      <el-button @click="router.back()">戻る</el-button>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <!-- 顧客情報 -->
        <div class="mb-8">
          <h2 class="text-lg font-medium mb-4">顧客情報</h2>
          <el-form-item label="顧客" prop="customer_id">
            <el-select
              v-model="form.customer_id"
              filterable
              remote
              :remote-method="searchCustomers"
              :loading="customersLoading"
              placeholder="顧客を選択または検索"
              class="w-full"
            >
              <el-option
                v-for="customer in customers"
                :key="customer.id"
                :label="customer.name"
                :value="customer.id"
              >
                <div>
                  <div>{{ customer.name }}</div>
                  <div class="text-xs text-gray-500">
                    {{ customer.phone }} / {{ customer.email }}
                  </div>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </div>

        <!-- 施術情報 -->
        <div class="mb-8">
          <h2 class="text-lg font-medium mb-4">施術希望</h2>
          <el-form-item label="施術内容" prop="service_type">
            <el-select v-model="form.service_type" class="w-full">
              <el-option label="ジェルネイル" value="ジェルネイル" />
              <el-option label="ネイルケア" value="ネイルケア" />
              <el-option label="ネイルアート" value="ネイルアート" />
              <el-option label="ハンドケア" value="ハンドケア" />
            </el-select>
          </el-form-item>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <el-form-item label="爪の長さ" prop="nail_length">
              <el-select v-model="form.nail_length" class="w-full">
                <el-option label="短め" value="short" />
                <el-option label="普通" value="medium" />
                <el-option label="長め" value="long" />
              </el-select>
            </el-form-item>

            <el-form-item label="爪の形" prop="nail_shape">
              <el-select v-model="form.nail_shape" class="w-full">
                <el-option label="スクエア" value="square" />
                <el-option label="ラウンド" value="round" />
                <el-option label="オーバル" value="oval" />
                <el-option label="アーモンド" value="almond" />
                <el-option label="スティレット" value="stiletto" />
                <el-option label="コフィン" value="coffin" />
              </el-select>
            </el-form-item>
          </div>
        </div>

        <!-- 健康状態 -->
        <div class="mb-8">
          <h2 class="text-lg font-medium mb-4">健康状態</h2>
          
          <el-form-item label="アレルギー" prop="has_allergies">
            <el-radio-group v-model="form.has_allergies">
              <el-radio :label="true">あり</el-radio>
              <el-radio :label="false">なし</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item
            v-if="form.has_allergies"
            label="アレルギー詳細"
            prop="allergies_details"
          >
            <el-input
              v-model="form.allergies_details"
              type="textarea"
              rows="3"
              placeholder="アレルギーの詳細を入力してください"
            />
          </el-form-item>

          <el-form-item label="既往歴" prop="has_medical_conditions">
            <el-radio-group v-model="form.has_medical_conditions">
              <el-radio :label="true">あり</el-radio>
              <el-radio :label="false">なし</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item
            v-if="form.has_medical_conditions"
            label="既往歴詳細"
            prop="medical_details"
          >
            <el-input
              v-model="form.medical_details"
              type="textarea"
              rows="3"
              placeholder="既往歴の詳細を入力してください"
            />
          </el-form-item>
        </div>

        <!-- 備考 -->
        <div class="mb-8">
          <h2 class="text-lg font-medium mb-4">その他</h2>
          <el-form-item label="備考" prop="notes">
            <el-input
              v-model="form.notes"
              type="textarea"
              rows="3"
              placeholder="特記事項があれば入力してください"
            />
          </el-form-item>
        </div>

        <div class="flex justify-end space-x-4">
          <el-button @click="router.back()">キャンセル</el-button>
          <el-button type="primary" native-type="submit" :loading="submitting">
            保存
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useCounselingStore } from '~/stores/counseling';
import { useCustomerStore } from '~/stores/customers';

const router = useRouter();
const counselingStore = useCounselingStore();
const customerStore = useCustomerStore();

const formRef = ref(null);
const submitting = ref(false);
const customersLoading = ref(false);
const customers = ref([]);

// Form model
const form = reactive({
  customer_id: '',
  service_type: '',
  nail_length: '',
  nail_shape: '',
  has_allergies: false,
  allergies_details: '',
  has_medical_conditions: false,
  medical_details: '',
  notes: '',
});

// Validation rules
const rules = {
  customer_id: [
    { required: true, message: '顧客を選択してください', trigger: 'change' }
  ],
  service_type: [
    { required: true, message: '施術内容を選択してください', trigger: 'change' }
  ],
  nail_length: [
    { required: true, message: '爪の長さを選択してください', trigger: 'change' }
  ],
  nail_shape: [
    { required: true, message: '爪の形を選択してください', trigger: 'change' }
  ],
  allergies_details: [
    { 
      required: true, 
      message: 'アレルギーの詳細を入力してください', 
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (form.has_allergies && !value) {
          callback(new Error('アレルギーの詳細を入力してください'));
        } else {
          callback();
        }
      }
    }
  ],
  medical_details: [
    {
      required: true,
      message: '既往歴の詳細を入力してください',
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (form.has_medical_conditions && !value) {
          callback(new Error('既往歴の詳細を入力してください'));
        } else {
          callback();
        }
      }
    }
  ]
};

// Methods
const searchCustomers = async (query) => {
  if (query) {
    customersLoading.value = true;
    try {
      await customerStore.fetchCustomers();
      customers.value = customerStore.customers;
    } catch (error) {
      ElMessage.error('顧客データの取得に失敗しました');
    } finally {
      customersLoading.value = false;
    }
  } else {
    customers.value = [];
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        await counselingStore.createSheet(form);
        ElMessage.success('カウンセリングシートを作成しました');
        router.push('/admin/counseling');
      } catch (error) {
        ElMessage.error('カウンセリングシートの作成に失敗しました');
      } finally {
        submitting.value = false;
      }
    }
  });
};
</script>
```