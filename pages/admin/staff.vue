<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">スタッフ管理</h1>
      <el-button type="primary" @click="showStaffDialog = true">
        新規スタッフ登録
      </el-button>
    </div>

    <!-- スタッフ一覧 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="staff in staffList" :key="staff.id" class="bg-white rounded-lg shadow">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
              {{ staff.name.charAt(0) }}
            </div>
            <div>
              <h3 class="text-lg font-semibold">{{ staff.name }}</h3>
              <p class="text-sm text-gray-500">{{ staff.role }}</p>
            </div>
          </div>

          <div class="space-y-2 mb-4">
            <div class="flex items-center">
              <span class="text-gray-500 w-24">メール:</span>
              <span>{{ staff.email }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-gray-500 w-24">電話番号:</span>
              <span>{{ staff.phone }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-gray-500 w-24">勤務開始:</span>
              <span>{{ formatDate(staff.startDate) }}</span>
            </div>
          </div>

          <div class="border-t pt-4">
            <h4 class="text-sm font-medium mb-2">得意な施術</h4>
            <div class="flex flex-wrap gap-2">
              <el-tag v-for="skill in staff.skills" :key="skill" size="small">
                {{ skill }}
              </el-tag>
            </div>
          </div>

          <div class="flex justify-end mt-4 space-x-2">
            <el-button size="small" @click="editStaff(staff)">編集</el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="confirmDeleteStaff(staff)"
            >
              削除
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- スタッフ登録/編集ダイアログ -->
    <el-dialog
      v-model="showStaffDialog"
      :title="editingStaff ? 'スタッフ情報編集' : '新規スタッフ登録'"
      width="500px"
    >
      <el-form 
        :model="staffForm" 
        :rules="rules" 
        ref="staffFormRef" 
        label-position="top"
      >
        <el-form-item label="名前" prop="name">
          <el-input v-model="staffForm.name" />
        </el-form-item>

        <el-form-item label="役職" prop="role">
          <el-select v-model="staffForm.role" class="w-full">
            <el-option label="店長" value="店長" />
            <el-option label="シニアネイリスト" value="シニアネイリスト" />
            <el-option label="ネイリスト" value="ネイリスト" />
            <el-option label="アシスタント" value="アシスタント" />
          </el-select>
        </el-form-item>

        <el-form-item label="メールアドレス" prop="email">
          <el-input v-model="staffForm.email" type="email" />
        </el-form-item>

        <el-form-item label="電話番号" prop="phone">
          <el-input v-model="staffForm.phone" />
        </el-form-item>

        <el-form-item label="勤務開始日" prop="startDate">
          <el-date-picker
            v-model="staffForm.startDate"
            type="date"
            placeholder="日付を選択"
            class="w-full"
          />
        </el-form-item>

        <el-form-item label="得意な施術" prop="skills">
          <el-select
            v-model="staffForm.skills"
            multiple
            class="w-full"
            placeholder="施術を選択"
          >
            <el-option label="ジェルネイル" value="ジェルネイル" />
            <el-option label="スカルプチュア" value="スカルプチュア" />
            <el-option label="ネイルケア" value="ネイルケア" />
            <el-option label="フットケア" value="フットケア" />
            <el-option label="ハンドケア" value="ハンドケア" />
            <el-option label="アート" value="アート" />
          </el-select>
        </el-form-item>

        <el-form-item label="備考" prop="notes">
          <el-input
            v-model="staffForm.notes"
            type="textarea"
            rows="3"
            placeholder="特記事項があれば入力してください"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showStaffDialog = false">キャンセル</el-button>
          <el-button type="primary" @click="saveStaff">
            {{ editingStaff ? '更新' : '登録' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 削除確認ダイアログ -->
    <el-dialog
      v-model="showDeleteDialog"
      title="スタッフ削除の確認"
      width="400px"
    >
      <p>このスタッフを削除してもよろしいですか？</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDeleteDialog = false">キャンセル</el-button>
          <el-button type="danger" @click="deleteStaff">削除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import dayjs from 'dayjs';

// State
const showStaffDialog = ref(false);
const showDeleteDialog = ref(false);
const editingStaff = ref(false);
const staffToDelete = ref(null);
const staffFormRef = ref(null);

// Form model
const staffForm = reactive({
  name: '',
  role: '',
  email: '',
  phone: '',
  startDate: '',
  skills: [],
  notes: ''
});

// Validation rules
const rules = {
  name: [
    { required: true, message: '名前を入力してください', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '役職を選択してください', trigger: 'change' }
  ],
  email: [
    { required: true, message: 'メールアドレスを入力してください', trigger: 'blur' },
    { type: 'email', message: '有効なメールアドレスを入力してください', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '電話番号を入力してください', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '勤務開始日を選択してください', trigger: 'change' }
  ]
};

// Sample data
const staffList = ref([
  {
    id: 1,
    name: '山田 愛子',
    role: 'シニアネイリスト',
    email: 'yamada.aiko@example.com',
    phone: '090-1234-5678',
    startDate: '2022-04-01',
    skills: ['ジェルネイル', 'スカルプチュア', 'アート'],
    notes: 'コンテストで入賞経験あり'
  },
  {
    id: 2,
    name: '佐藤 美咲',
    role: 'ネイリスト',
    email: 'sato.misaki@example.com',
    phone: '080-8765-4321',
    startDate: '2023-06-15',
    skills: ['ジェルネイル', 'ネイルケア', 'ハンドケア'],
    notes: ''
  },
  {
    id: 3,
    name: '田中 優子',
    role: '店長',
    email: 'tanaka.yuko@example.com',
    phone: '070-9876-5432',
    startDate: '2021-08-01',
    skills: ['ジェルネイル', 'スカルプチュア', 'フットケア', 'アート'],
    notes: '社内講師資格保有'
  }
]);

// Methods
const formatDate = (date) => {
  return dayjs(date).format('YYYY年M月D日');
};

const editStaff = (staff) => {
  editingStaff.value = true;
  Object.assign(staffForm, staff);
  showStaffDialog.value = true;
};

const confirmDeleteStaff = (staff) => {
  staffToDelete.value = staff;
  showDeleteDialog.value = true;
};

const saveStaff = async () => {
  if (!staffFormRef.value) return;

  await staffFormRef.value.validate(async (valid) => {
    if (valid) {
      if (editingStaff.value) {
        const index = staffList.value.findIndex(s => s.id === staffForm.id);
        if (index !== -1) {
          staffList.value[index] = { ...staffForm };
        }
      } else {
        const newStaff = {
          id: staffList.value.length + 1,
          ...staffForm
        };
        staffList.value.push(newStaff);
      }

      resetForm();
      showStaffDialog.value = false;
    }
  });
};

const deleteStaff = () => {
  if (!staffToDelete.value) return;

  const index = staffList.value.findIndex(s => s.id === staffToDelete.value.id);
  if (index !== -1) {
    staffList.value.splice(index, 1);
  }

  showDeleteDialog.value = false;
  staffToDelete.value = null;
};

const resetForm = () => {
  if (staffFormRef.value) {
    staffFormRef.value.resetFields();
  }
  
  Object.assign(staffForm, {
    name: '',
    role: '',
    email: '',
    phone: '',
    startDate: '',
    skills: [],
    notes: ''
  });
  
  editingStaff.value = false;
};
</script>