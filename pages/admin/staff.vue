<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">スタッフ管理</h1>
      <el-button 
        type="primary" 
        @click="showStaffDialog = true"
        :loading="loading"
      >
        新規スタッフ登録
      </el-button>
    </div>

    <!-- スタッフ一覧 -->
    <div 
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      v-loading="loading"
    >
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
              <span>{{ formatDate(staff.start_date) }}</span>
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

        <el-form-item label="勤務開始日" prop="start_date">
          <el-date-picker
            v-model="staffForm.start_date"
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
import { ref, reactive, onMounted } from 'vue';
import { useStaffStore } from '~/stores/staff';
import dayjs from 'dayjs';

const staffStore = useStaffStore();
const showStaffDialog = ref(false);
const showDeleteDialog = ref(false);
const editingStaff = ref(false);
const staffFormRef = ref(null);
const staffToDelete = ref(null);
const creating = ref(false);

const loading = computed(() => staffStore.loading);
const error = computed(() => staffStore.error);
const staffList = computed(() => staffStore.staff);

// スタッフ登録フォーム
const staffForm = reactive({
  name: '',
  role: '',
  email: '',
  phone: '',
  start_date: null,
  skills: [],
  notes: ''
});

// バリデーションルール
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
  start_date: [
    { required: true, message: '勤務開始日を選択してください', trigger: 'change' }
  ]
};

const loadStaff = async () => {
  try {
    await staffStore.fetchStaff();
  } catch (e) {
    ElMessage.error('スタッフ情報の取得に失敗しました');
  }
};

// Methods
const formatDate = (date) => {
  if (!date) return '日付なし';
  const parsedDate = dayjs(date);
  return parsedDate.isValid() ? parsedDate.format('YYYY年M月D日') : '日付なし';
};

const editStaff = (staff) => {
  editingStaff.value = true;
  const startDate = staff.start_date ? dayjs(staff.start_date).isValid() ? 
    dayjs(staff.start_date).toDate() : null : null;
    
  Object.assign(staffForm, {
    ...staff,
    start_date: startDate
  });
  showStaffDialog.value = true;
};

const confirmDeleteStaff = (staff) => {
  staffToDelete.value = staff;
  showDeleteDialog.value = true;
};

const saveStaff = async () => {
  if (!staffFormRef.value) return;
  creating.value = true;

  await staffFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const startDate = staffForm.start_date && dayjs(staffForm.start_date).isValid() ? 
          dayjs(staffForm.start_date).format('YYYY-MM-DD') : null;

        const staffData = {
          name: staffForm.name,
          email: staffForm.email,
          phone: staffForm.phone,
          role: staffForm.role,
          skills: staffForm.skills,
          start_date: startDate,
          notes: staffForm.notes
        };

        if (editingStaff.value) {
          await staffStore.updateStaff(staffForm.id, staffData);
          ElMessage.success('スタッフ情報を更新しました');
        } else {
          await staffStore.createStaff(staffData);
          ElMessage.success('スタッフを登録しました');
        }
        resetForm();
        showStaffDialog.value = false;
      } catch (e) {
        ElMessage.error(editingStaff.value ? 'スタッフ情報の更新に失敗しました' : 'スタッフの登録に失敗しました');
      }
    }
  }).finally(() => {
    creating.value = false;
  });
};

const deleteStaff = async () => {
  if (!staffToDelete.value) return;
  
  try {
    await staffStore.deleteStaff(staffToDelete.value.id);
    ElMessage.success('スタッフを削除しました');
    showDeleteDialog.value = false;
    staffToDelete.value = null;
  } catch (e) {
    ElMessage.error('スタッフの削除に失敗しました');
  }
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
    start_date: null,
    skills: [],
    notes: ''
  });
  
  editingStaff.value = false;
};

// Load initial data
onMounted(async () => {
  try {
    await staffStore.fetchStaff();
  } catch (error) {
    ElMessage.error('スタッフデータの取得に失敗しました');
  }
});
</script>