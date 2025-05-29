<template>
  <div class="p-4 sm:p-6">
    <h1 class="text-2xl font-bold mb-6">ダッシュボード</h1>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <!-- Summary Cards -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-1">本日の来店数</h3>
        <div class="flex items-end justify-between">
          <span class="text-2xl font-bold">24</span>
          <span class="text-sm text-success">+12% ↑</span>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-1">本日の売上</h3>
        <div class="flex items-end justify-between">
          <span class="text-2xl font-bold">¥78,500</span>
          <span class="text-sm text-success">+8% ↑</span>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-1">新規カウンセリングシート</h3>
        <div class="flex items-end justify-between">
          <span class="text-2xl font-bold">7</span>
          <span class="text-sm text-error">-3% ↓</span>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-1">予約待ち</h3>
        <div class="flex items-end justify-between">
          <span class="text-2xl font-bold">12</span>
          <span class="text-sm text-success">+5% ↑</span>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <!-- Recent Customers -->
      <div class="bg-white rounded-lg shadow p-4 sm:p-6 lg:col-span-2">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium">最近の来店客</h2>
          <el-button type="primary" size="small" plain>すべて表示</el-button>
        </div>
        
        <el-table :data="recentCustomers" style="width: 100%">
          <el-table-column prop="name" label="お客様名" />
          <el-table-column prop="service" label="施術内容" />
          <el-table-column prop="time" label="来店時間" width="180" />
          <el-table-column fixed="right" label="操作" width="120">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="viewCustomer(scope.row)">詳細</el-button>
              <el-button link type="primary" size="small">編集</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- Recent Counseling Forms -->
      <div class="bg-white rounded-lg shadow p-4 sm:p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium">最近のカウンセリングシート</h2>
          <el-button type="primary" size="small" plain>すべて表示</el-button>
        </div>
        
        <div class="space-y-4">
          <div v-for="form in recentCounselingForms" :key="form.id" class="border-b pb-3 last:border-b-0">
            <div class="flex justify-between">
              <h4 class="font-medium">{{ form.customerName }}</h4>
              <span class="text-xs text-gray-500">{{ form.timeAgo }}</span>
            </div>
            <p class="text-sm text-gray-600 truncate">{{ form.service }}</p>
            <div class="flex justify-end mt-2">
              <el-button link type="primary" size="small">処理</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Weekly Revenue Chart -->
    <div class="mt-4 sm:mt-6 bg-white rounded-lg shadow p-4 sm:p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-medium">週間売上推移</h2>
        <el-select v-model="selectedPeriod" placeholder="期間選択" size="small">
          <el-option label="今週" value="this-week" />
          <el-option label="先週" value="last-week" />
          <el-option label="今月" value="this-month" />
        </el-select>
      </div>
      
      <div class="h-60 sm:h-80">
        <!-- This would be replaced with actual chart component -->
        <div class="h-full flex items-center justify-center bg-gray-100 rounded">
          <p class="text-gray-500">売上グラフ表示エリア</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const selectedPeriod = ref('this-week');

const recentCustomers = ref([
  { id: 1, name: '田中 優子', service: 'ジェルネイル', time: '2024-04-03 14:30' },
  { id: 2, name: '鈴木 明', service: 'ネイルケア', time: '2024-04-03 13:15' },
  { id: 3, name: '渡辺 美緒', service: 'ネイルケア＆補修', time: '2024-04-03 11:45' },
  { id: 4, name: '佐藤 花子', service: 'フレンチネイル', time: '2024-04-03 10:30' },
  { id: 5, name: '山本 恵子', service: 'ジェル延長', time: '2024-04-02 16:00' }
]);

const recentCounselingForms = ref([
  { id: 1, customerName: '小林 愛子', service: 'ジェルネイル', timeAgo: '10分前' },
  { id: 2, customerName: '中村 由衣', service: 'ネイルケア', timeAgo: '25分前' },
  { id: 3, customerName: '加藤 理沙', service: 'ネイル延長', timeAgo: '1時間前' },
  { id: 4, customerName: '伊藤 桃子', service: 'ハンドケア', timeAgo: '2時間前' }
]);

const viewCustomer = (customer) => {
  // Would navigate to customer detail page in full implementation
  console.log('顧客詳細表示:', customer);
};
</script>