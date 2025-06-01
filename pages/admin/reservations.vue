<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">予約管理</h1>
      <el-button type="primary" @click="showCreateReservationDialog = true">
        新規予約登録
      </el-button>
    </div>

    <!-- カレンダー表示 -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center gap-4">
          <el-button-group>
            <el-button @click="changeView('month')">月</el-button>
            <el-button @click="changeView('week')">週</el-button>
            <el-button @click="changeView('day')">日</el-button>
          </el-button-group>
          
          <el-button @click="goToToday">今日</el-button>
        </div>
        
        <div class="flex items-center gap-2">
          <el-button @click="previousPeriod">
            <i class="el-icon-arrow-left"></i>
          </el-button>
          <span class="text-lg font-medium">{{ currentPeriodLabel }}</span>
          <el-button @click="nextPeriod">
            <i class="el-icon-arrow-right"></i>
          </el-button>
        </div>
      </div>

      <div class="calendar-grid">
        <!-- 曜日ヘッダー -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div v-for="day in weekDays" :key="day" class="text-center py-2 text-sm font-medium">
            {{ day }}
          </div>
        </div>

        <!-- カレンダーグリッド -->
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="date in calendarDates"
            :key="date.toISOString()"
            class="min-h-[120px] border rounded-lg p-2"
            :class="{
              'bg-primary-light': isToday(date),
              'bg-gray-50': !isSameMonth(date)
            }"
          >
            <div class="flex justify-between items-center mb-2">
              <span :class="{ 'text-gray-400': !isSameMonth(date) }">
                {{ date.getDate() }}
              </span>
              <el-button
                v-if="isSameMonth(date)"
                size="small"
                @click="createReservation(date)"
              >
                +
              </el-button>
            </div>

            <!-- 予約表示 -->
            <div class="space-y-1">
              <div
                v-for="reservation in getReservationsForDate(date)"
                :key="reservation.id"
                class="text-xs p-2 rounded cursor-pointer mb-1 shadow-sm hover:shadow-md transition-shadow"
                :class="getReservationClass(reservation)"
                @click="viewReservation(reservation)"
              >
                <div class="truncate font-medium">{{ reservation.customers?.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 予約作成/編集ダイアログ -->
    <el-dialog
      v-model="showCreateReservationDialog"
      :title="editingReservation ? '予約編集' : '新規予約登録'"
      width="500px"
    >
      <el-form :model="reservationForm" label-position="top" :rules="rules" ref="formRef">
        <el-form-item label="お客様" prop="customer_id">
          <el-select
            v-model="reservationForm.customer_id"
            filterable
            placeholder="顧客を選択"
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

        <el-form-item label="予約日時" prop="start_time">
          <el-date-picker
            v-model="reservationForm.start_time"
            type="datetime"
            format="YYYY/MM/DD HH:mm"
            placeholder="日時を選択"
            class="w-full"
            :disabled-date="disabledDate"
            :disabled-hours="disabledHours"
          />
        </el-form-item>

        <el-form-item label="施術内容" prop="service_type">
          <el-select v-model="reservationForm.service_type" class="w-full">
            <el-option label="ジェルネイル" value="ジェルネイル" />
            <el-option label="ネイルケア" value="ネイルケア" />
            <el-option label="ネイルアート" value="ネイルアート" />
            <el-option label="ハンドケア" value="ハンドケア" />
          </el-select>
        </el-form-item>

        <el-form-item label="担当スタッフ" prop="staff_id">
          <el-select v-model="reservationForm.staff_id" class="w-full">
            <el-option
              v-for="staff in staffMembers"
              :key="staff.id"
              :label="staff.name"
              :value="staff.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="備考" prop="notes">
          <el-input
            v-model="reservationForm.notes"
            type="textarea"
            rows="3"
            placeholder="特記事項があれば入力してください"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateReservationDialog = false">キャンセル</el-button>
          <el-button type="primary" @click="saveReservation">
            {{ editingReservation ? '更新' : '登録' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 予約詳細ドロワー -->
    <el-drawer
      v-model="showReservationDrawer"
      title="予約詳細"
      direction="rtl"
      size="400px"
    >
      <div v-if="selectedReservation" class="p-4">
        <div class="mb-6">
          <h3 class="text-xl font-bold mb-2">{{ selectedReservation.customerName }}</h3>
          <p class="text-gray-500">
            {{ formatDateTime(selectedReservation.datetime) }}
          </p>
        </div>

        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-500">施術内容</p>
            <p>{{ selectedReservation.service }}</p>
          </div>

          <div>
            <p class="text-sm text-gray-500">担当スタッフ</p>
            <p>{{ selectedReservation.staff }}</p>
          </div>

          <div>
            <p class="text-sm text-gray-500">備考</p>
            <p>{{ selectedReservation.notes || '特記事項なし' }}</p>
          </div>
        </div>

        <div class="flex justify-end mt-6 space-x-2">
          <el-button @click="editReservation(selectedReservation)">
            編集
          </el-button>
          <el-button type="danger" @click="confirmDeleteReservation">
            キャンセル
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- キャンセル確認ダイアログ -->
    <el-dialog
      v-model="showDeleteDialog"
      title="予約キャンセルの確認"
      width="400px"
    >
      <p>この予約をキャンセルしてもよろしいですか？</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDeleteDialog = false">いいえ</el-button>
          <el-button type="danger" @click="deleteReservation">はい</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import { useAppointmentStore } from '~/stores/appointments';
import { useCustomerStore } from '~/stores/customers';
import { useStaffStore } from '~/stores/staff';
import { onMounted } from 'vue';

dayjs.locale('ja');

// State
const currentDate = ref(new Date());
const currentView = ref('month');
const showCreateReservationDialog = ref(false);
const showReservationDrawer = ref(false);
const showDeleteDialog = ref(false);
const editingReservation = ref(false);
const selectedReservation = ref(null);
const formRef = ref(null);
const appointmentStore = useAppointmentStore();
const customerStore = useCustomerStore();
const staffStore = useStaffStore();
const customersLoading = ref(false);
const staffLoading = ref(false);

// Form model
const reservationForm = reactive({
  customer_id: '',
  staff_id: '',
  service_type: '',
  start_time: null,
  end_time: null,
  notes: ''
});

// Validation rules
const rules = {
  customer_id: [
    { required: true, message: 'お客様を選択してください', trigger: 'change' }
  ],
  staff_id: [
    { required: true, message: '担当スタッフを選択してください', trigger: 'change' }
  ],
  start_time: [
    { required: true, message: '予約日時を選択してください', trigger: 'change' }
  ],
  service_type: [
    { required: true, message: '施術内容を選択してください', trigger: 'change' }
  ]
};

const appointments = computed(() => appointmentStore.appointments);
const loading = computed(() => appointmentStore.loading);

// Computed
const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

const currentPeriodLabel = computed(() => {
  return dayjs(currentDate.value).format('YYYY年 M月');
});

const calendarDates = computed(() => {
  const start = dayjs(currentDate.value).startOf('month').startOf('week');
  const end = dayjs(currentDate.value).endOf('month').endOf('week');
  const dates = [];
  
  let current = start;
  while (current.isBefore(end)) {
    dates.push(current.toDate());
    current = current.add(1, 'day');
  }
  
  return dates;
});

// Methods
const changeView = (view) => {
  currentView.value = view;
};

const goToToday = () => {
  currentDate.value = new Date();
};

const previousPeriod = () => {
  currentDate.value = dayjs(currentDate.value).subtract(1, 'month').toDate();
};

const nextPeriod = () => {
  currentDate.value = dayjs(currentDate.value).add(1, 'month').toDate();
};

const isToday = (date) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

const isSameMonth = (date) => {
  return dayjs(date).isSame(currentDate.value, 'month');
};

const getReservationsForDate = computed(() => (date) => {
  return appointments.value.filter(appointment => 
    dayjs(appointment.start_time).isSame(date, 'day')
  );
});

const disabledDate = (date) => {
  return date < dayjs().startOf('day');
};

const disabledHours = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    if (i < 9 || i >= 19) {
      hours.push(i);
    }
  }
  return hours;
};
const getReservationClass = (reservation) => {
  return {
    'bg-primary text-white': reservation.service_type === 'ジェルネイル',
    'bg-secondary text-white': reservation.service_type === 'ネイルケア',
    'bg-accent text-white': reservation.service_type === 'ネイルアート',
    'bg-success text-white': reservation.service_type === 'ハンドケア'
  };
};

// State for customers and staff
const customers = ref([]);
const staffMembers = ref([]);

const createReservation = (date) => {
  editingReservation.value = false;
  reservationForm.start_time = dayjs(date).format('YYYY-MM-DD HH:mm:ss');
  // 1時間後をデフォルトの終了時間に設定
  reservationForm.end_time = dayjs(date).add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
  showCreateReservationDialog.value = true;
};

const viewReservation = (reservation) => {
  selectedReservation.value = reservation;
  selectedReservation.value.customerName = reservation.customers?.name;
  selectedReservation.value.service = reservation.service_type;
  selectedReservation.value.staff = reservation.staff?.name;
  showReservationDrawer.value = true;
};

const editReservation = (reservation) => {
  editingReservation.value = true;
  Object.assign(reservationForm, { ...reservation });
  showReservationDrawer.value = false;
  showCreateReservationDialog.value = true;
};

const saveReservation = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      const appointmentData = {
        customer_id: reservationForm.customer_id,
        staff_id: reservationForm.staff_id,
        service_type: reservationForm.service_type,
        start_time: reservationForm.start_time,
        end_time: reservationForm.end_time,
        notes: reservationForm.notes,
        status: 'Scheduled'
      };

      if (editingReservation.value) {
        await appointmentStore.updateAppointment(selectedReservation.value.id, appointmentData);
        ElMessage.success('予約を更新しました');
      } else {
        await appointmentStore.createAppointment(appointmentData);
        ElMessage.success('予約を登録しました');
      }
      
      resetForm();
      showCreateReservationDialog.value = false;
    }
  });
};

const confirmDeleteReservation = () => {
  showDeleteDialog.value = true;
};

const deleteReservation = async () => {
  try {
    await appointmentStore.deleteAppointment(selectedReservation.value.id);
    ElMessage.success('予約をキャンセルしました');
    showDeleteDialog.value = false;
    showReservationDrawer.value = false;
  } catch (error) {
    ElMessage.error('予約のキャンセルに失敗しました');
  }
};

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  Object.assign(reservationForm, {
    customer_id: '',
    staff_id: '',
    service_type: '',
    start_time: null,
    end_time: null,
    notes: ''
  });
  editingReservation.value = false;
  selectedReservation.value = null;
};

const formatDateTime = (datetime) => {
  return dayjs(datetime).format('YYYY年M月D日 HH:mm');
};

// Computed properties for filtered appointments
const filteredAppointments = computed(() => {
  return appointments.value;
});

// Load initial data
onMounted(async () => {
  try {
    // Load all required data
    await Promise.all([
      appointmentStore.fetchAppointments(),
      customerStore.fetchCustomers(),
      staffStore.fetchStaff()
    ]);
    
    // Set local data
    customers.value = customerStore.customers;
    staffMembers.value = staffStore.staff;
  } catch (error) {
    ElMessage.error('データの取得に失敗しました');
  }
});
</script>

<style scoped>
.calendar-grid {
  min-height: 500px;
}

/* カレンダーセルのスタイリング */
.calendar-grid :deep(.el-button--small) {
  padding: 4px;
  min-height: 20px;
}

/* カレンダーセルの高さと余白の調整 */
.calendar-grid .grid-cols-7 > div {
  min-height: 100px;
  max-height: 120px;
  overflow-y: auto;
  padding: 8px;
}

/* スクロールバーのスタイリング */
.calendar-grid .grid-cols-7 > div::-webkit-scrollbar {
  width: 4px;
}

.calendar-grid .grid-cols-7 > div::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.calendar-grid .grid-cols-7 > div::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}

.calendar-grid .grid-cols-7 > div::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>