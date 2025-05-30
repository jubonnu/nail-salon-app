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
                class="text-xs p-1 rounded cursor-pointer"
                :class="getReservationClass(reservation)"
                @click="viewReservation(reservation)"
              >
                {{ reservation.time }} {{ reservation.customerName }}
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
        <el-form-item label="お客様名" prop="customerName">
          <el-input v-model="reservationForm.customerName" />
        </el-form-item>

        <el-form-item label="予約日時" prop="datetime">
          <el-date-picker
            v-model="reservationForm.datetime"
            type="datetime"
            format="YYYY/MM/DD HH:mm"
            placeholder="日時を選択"
            class="w-full"
          />
        </el-form-item>

        <el-form-item label="施術内容" prop="service">
          <el-select v-model="reservationForm.service" class="w-full">
            <el-option label="ジェルネイル" value="ジェルネイル" />
            <el-option label="ネイルケア" value="ネイルケア" />
            <el-option label="ネイルアート" value="ネイルアート" />
            <el-option label="ハンドケア" value="ハンドケア" />
          </el-select>
        </el-form-item>

        <el-form-item label="担当スタッフ" prop="staff">
          <el-select v-model="reservationForm.staff" class="w-full">
            <el-option label="山田 愛子" value="山田 愛子" />
            <el-option label="佐藤 美咲" value="佐藤 美咲" />
            <el-option label="田中 優子" value="田中 優子" />
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

// Form model
const reservationForm = reactive({
  customerName: '',
  datetime: null,
  service: '',
  staff: '',
  notes: ''
});

// Validation rules
const rules = {
  customerName: [
    { required: true, message: 'お客様名を入力してください', trigger: 'blur' }
  ],
  datetime: [
    { required: true, message: '予約日時を選択してください', trigger: 'change' }
  ],
  service: [
    { required: true, message: '施術内容を選択してください', trigger: 'change' }
  ],
  staff: [
    { required: true, message: '担当スタッフを選択してください', trigger: 'change' }
  ]
};

// Sample data
const reservations = ref([
  {
    id: 1,
    customerName: '山田 花子',
    datetime: '2024-04-05 10:00',
    service: 'ジェルネイル',
    staff: '山田 愛子',
    notes: 'アートの要望あり'
  },
  {
    id: 2,
    customerName: '鈴木 美咲',
    datetime: '2024-04-05 14:00',
    service: 'ネイルケア',
    staff: '佐藤 美咲',
    notes: ''
  }
]);

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

const getReservationsForDate = (date) => {
  return reservations.value.filter(reservation => 
    dayjs(reservation.datetime).isSame(date, 'day')
  );
};

const getReservationClass = (reservation) => {
  return {
    'bg-primary text-white': reservation.service === 'ジェルネイル',
    'bg-secondary text-white': reservation.service === 'ネイルケア',
    'bg-accent text-white': reservation.service === 'ネイルアート',
    'bg-success text-white': reservation.service === 'ハンドケア'
  };
};

const createReservation = (date) => {
  editingReservation.value = false;
  reservationForm.datetime = date;
  showCreateReservationDialog.value = true;
};

const viewReservation = (reservation) => {
  selectedReservation.value = reservation;
  showReservationDrawer.value = true;
};

const editReservation = (reservation) => {
  editingReservation.value = true;
  Object.assign(reservationForm, reservation);
  showReservationDrawer.value = false;
  showCreateReservationDialog.value = true;
};

const saveReservation = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (editingReservation.value) {
        const index = reservations.value.findIndex(r => r.id === selectedReservation.value.id);
        if (index !== -1) {
          reservations.value[index] = {
            ...selectedReservation.value,
            ...reservationForm
          };
        }
      } else {
        const newReservation = {
          id: reservations.value.length + 1,
          ...reservationForm
        };
        reservations.value.push(newReservation);
      }
      
      resetForm();
      showCreateReservationDialog.value = false;
    }
  });
};

const confirmDeleteReservation = () => {
  showDeleteDialog.value = true;
};

const deleteReservation = () => {
  const index = reservations.value.findIndex(r => r.id === selectedReservation.value.id);
  if (index !== -1) {
    reservations.value.splice(index, 1);
  }
  showDeleteDialog.value = false;
  showReservationDrawer.value = false;
};

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  Object.assign(reservationForm, {
    customerName: '',
    datetime: null,
    service: '',
    staff: '',
    notes: ''
  });
  editingReservation.value = false;
  selectedReservation.value = null;
};

const formatDateTime = (datetime) => {
  return dayjs(datetime).format('YYYY年M月D日 HH:mm');
};
</script>

<style scoped>
.calendar-grid {
  min-height: 600px;
}
</style>