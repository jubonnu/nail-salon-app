<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">売上・レポート</h1>
      <div class="flex gap-2" v-loading="loading">
        <el-button @click="exportReport" icon="DownloadOutlined">
          レポート出力
        </el-button>
        <el-button type="primary" @click="generateCustomReport">
          カスタムレポート
        </el-button>
      </div>
    </div>
    
    <!-- 期間選択 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <el-radio-group v-model="dateRangeType" @change="updateDateRange">
          <el-radio-button label="today">今日</el-radio-button>
          <el-radio-button label="week">今週</el-radio-button>
          <el-radio-button label="month">今月</el-radio-button>
          <el-radio-button label="year">今年</el-radio-button>
          <el-radio-button label="custom">カスタム</el-radio-button>
        </el-radio-group>
        
        <el-date-picker
          v-if="dateRangeType === 'custom'"
          v-model="customDateRange"
          type="daterange"
          range-separator="〜"
          start-placeholder="開始日"
          end-placeholder="終了日"
          @change="loadSalesData"
        />
      </div>
    </div>
    
    <!-- サマリーカード -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-1">総売上</h3>
        <div class="flex items-end justify-between">
          <span class="text-2xl font-bold">¥{{ summary.totalSales?.toLocaleString() || 0 }}</span>
          <span class="text-sm" :class="summary.salesTrend >= 0 ? 'text-success' : 'text-error'">
            {{ summary.salesTrend >= 0 ? '+' : '' }}{{ summary.salesTrend }}% 
            {{ summary.salesTrend >= 0 ? '↑' : '↓' }}
          </span>
        </div>
        <div class="mt-2">
          <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              class="h-full bg-primary" 
              :style="{ width: `${summary.targetProgress || 0}%` }"
            ></div>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            月間目標の{{ summary.targetProgress || 0 }}%達成
          </p>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-1">来店客数</h3>
        <div class="flex items-end justify-between">
          <span class="text-2xl font-bold">{{ summary.customerCount || 0 }}</span>
          <span class="text-sm" :class="summary.customerTrend >= 0 ? 'text-success' : 'text-error'">
            {{ summary.customerTrend >= 0 ? '+' : '' }}{{ summary.customerTrend }}% 
            {{ summary.customerTrend >= 0 ? '↑' : '↓' }}
          </span>
        </div>
        <div class="mt-2">
          <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              class="h-full bg-primary" 
              :style="{ width: `${summary.customerTargetProgress || 0}%` }"
            ></div>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            月間目標の{{ summary.customerTargetProgress || 0 }}%達成
          </p>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-1">平均客単価</h3>
        <div class="flex items-end justify-between">
          <span class="text-2xl font-bold">¥{{ summary.averageTransaction?.toLocaleString() || 0 }}</span>
          <span class="text-sm" :class="summary.avgTransactionTrend >= 0 ? 'text-success' : 'text-error'">
            {{ summary.avgTransactionTrend >= 0 ? '+' : '' }}{{ summary.avgTransactionTrend }}% 
            {{ summary.avgTransactionTrend >= 0 ? '↑' : '↓' }}
          </span>
        </div>
        <div class="mt-2">
          <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              class="h-full bg-primary" 
              :style="{ width: `${summary.avgTransactionTargetProgress || 0}%` }"
            ></div>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            目標単価の{{ summary.avgTransactionTargetProgress || 0 }}%達成
          </p>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-1">新規顧客数</h3>
        <div class="flex items-end justify-between">
          <span class="text-2xl font-bold">{{ summary.newCustomers || 0 }}</span>
          <span class="text-sm" :class="summary.newCustomerTrend >= 0 ? 'text-success' : 'text-error'">
            {{ summary.newCustomerTrend >= 0 ? '+' : '' }}{{ summary.newCustomerTrend }}% 
            {{ summary.newCustomerTrend >= 0 ? '↑' : '↓' }}
          </span>
        </div>
        <div class="mt-2">
          <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              class="h-full" 
              :class="summary.newCustomerTargetProgress >= 70 ? 'bg-primary' : 'bg-warning'"
              :style="{ width: `${summary.newCustomerTargetProgress || 0}%` }"
            ></div>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            月間目標の{{ summary.newCustomerTargetProgress || 0 }}%達成
          </p>
        </div>
      </div>
    </div>
    
    <!-- 売上グラフ -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-medium">売上推移</h2>
        <el-select v-model="chartType" placeholder="表示単位" size="small">
          <el-option label="日次" value="daily" />
          <el-option label="週次" value="weekly" />
          <el-option label="月次" value="monthly" />
        </el-select>
      </div>
      
      <div class="h-80">
        <!-- 実際のチャートコンポーネントに置き換え -->
        <div class="h-full flex items-center justify-center bg-gray-100 rounded">
          <p class="text-gray-500">売上グラフ表示エリア</p>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- 人気施術 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-medium mb-4">人気施術ランキング</h2>
        <el-table :data="topServices" style="width: 100%">
          <el-table-column prop="service" label="施術内容" />
          <el-table-column prop="revenue" label="売上" />
          <el-table-column prop="customers" label="顧客数" />
          <el-table-column label="前月比">
            <template #default="scope">
              <span :class="scope.row.trend > 0 ? 'text-success' : 'text-error'">
                {{ scope.row.trend > 0 ? '+' : '' }}{{ scope.row.trend }}% 
                {{ scope.row.trend > 0 ? '↑' : '↓' }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 施術割合 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-medium mb-4">施術割合</h2>
        <div class="h-64">
          <!-- 実際のチャートコンポーネントに置き換え -->
          <div class="h-full flex items-center justify-center bg-gray-100 rounded">
            <p class="text-gray-500">円グラフ表示エリア</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 最近の売上 -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-medium">最近の売上</h2>
        <el-button type="primary" size="small" plain>すべて表示</el-button>
      </div>
      
      <el-table :data="recentSales" style="width: 100%">
        <el-table-column prop="date" label="日時" width="180" />
        <el-table-column prop="customers.name" label="お客様名" />
        <el-table-column prop="appointments.service_type" label="施術内容" />
        <el-table-column prop="staff.name" label="担当スタッフ" />
        <el-table-column prop="amount" label="金額" />
        <el-table-column prop="paymentMethod" label="支払方法" />
        <el-table-column fixed="right" label="操作" width="120">
          <template #default>
            <el-button link type="primary" size="small" @click="viewSalesDetail">
              詳細
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSalesStore } from '~/stores/sales';

const salesStore = useSalesStore();
const selectedPeriod = ref('this-week');

const loading = computed(() => salesStore.loading);
const error = computed(() => salesStore.error);
const summary = computed(() => salesStore.summary || {});
const recentSales = computed(() => salesStore.records.slice(0, 5));

const loadData = async () => {
  try {
    await Promise.all([
      salesStore.fetchSummary(selectedPeriod.value),
      salesStore.fetchRecords()
    ]);
  } catch (e) {
    ElMessage.error('データの取得に失敗しました');
  }
};

const handlePeriodChange = async () => {
  await salesStore.fetchSummary(selectedPeriod.value);
};

onMounted(loadData);

watch(selectedPeriod, handlePeriodChange);
</script>