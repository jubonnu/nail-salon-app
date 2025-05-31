<template>
  <div class="p-4 sm:p-6 bg-gray-50">
    <h1 class="text-2xl font-bold mb-6">ダッシュボード</h1>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Summary Cards -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-1">本日の来店数</h3>
        <div class="flex items-end justify-between">
          <span class="text-2xl font-bold">24</span>
          <span class="text-sm text-success">+12% ↑</span>
        </div>
        <div class="mt-2">
          <div class="h-1 bg-gray-100 rounded-full">
            <div class="h-full bg-success rounded-full" style="width: 75%"></div>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-1">本日の売上</h3>
        <div class="flex items-end justify-between">
          <span class="text-2xl font-bold">¥78,500</span>
          <span class="text-sm text-success">+8% ↑</span>
        </div>
        <div class="mt-2">
          <div class="h-1 bg-gray-100 rounded-full">
            <div class="h-full bg-primary rounded-full" style="width: 68%"></div>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-1">新規カウンセリングシート</h3>
        <div class="flex items-end justify-between">
          <span class="text-2xl font-bold">7</span>
          <span class="text-sm text-error">-3% ↓</span>
        </div>
        <div class="mt-2">
          <div class="h-1 bg-gray-100 rounded-full">
            <div class="h-full bg-warning rounded-full" style="width: 45%"></div>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-1">予約待ち</h3>
        <div class="flex items-end justify-between">
          <span class="text-2xl font-bold">12</span>
          <span class="text-sm text-success">+5% ↑</span>
        </div>
        <div class="mt-2">
          <div class="h-1 bg-gray-100 rounded-full">
            <div class="h-full bg-accent rounded-full" style="width: 82%"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- Recent Customers -->
      <div class="bg-white rounded-lg shadow p-4 sm:p-6 lg:col-span-2">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium">最近の来店客</h2>
          <NuxtLink to="/admin/customers">
            <el-button type="primary" size="small" plain>すべて表示</el-button>
          </NuxtLink>
        </div>
        
        <el-table :data="recentCustomers" style="width: 100%">
          <el-table-column prop="name" label="お客様名" />
          <el-table-column prop="service" label="施術内容" />
          <el-table-column prop="time" label="来店時間" width="180" />
          <el-table-column fixed="right" label="操作" width="120">
            <template #default="scope">
              <NuxtLink :to="`/admin/customers?id=${scope.row.id}`">
                <el-button link type="primary" size="small">詳細</el-button>
              </NuxtLink>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- Recent Counseling Forms -->
      <div class="bg-white rounded-lg shadow p-4 sm:p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium">最近のカウンセリングシート</h2>
          <NuxtLink to="/admin/counseling">
            <el-button type="primary" size="small" plain>すべて表示</el-button>
          </NuxtLink>
        </div>
        
        <div class="space-y-4">
          <div v-for="form in recentCounselingForms" :key="form.id" class="border-b pb-3 last:border-b-0">
            <div class="flex justify-between">
              <h4 class="font-medium">{{ form.customerName }}</h4>
              <span class="text-xs text-gray-500">{{ form.timeAgo }}</span>
            </div>
            <p class="text-sm text-gray-600 truncate">{{ form.service }}</p>
            <div class="flex justify-end mt-2">
              <NuxtLink :to="`/admin/counseling?id=${form.id}`">
                <el-button link type="primary" size="small">処理</el-button>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick Actions Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <NuxtLink to="/admin/reservations" class="block">
        <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
          <div class="flex items-center mb-4">
            <el-icon class="text-2xl text-primary mr-3"><Calendar /></el-icon>
            <h3 class="text-lg font-medium">予約管理</h3>
          </div>
          <p class="text-sm text-gray-600">本日の予約: 8件</p>
        </div>
      </NuxtLink>
      
      <NuxtLink to="/admin/instagram" class="block">
        <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
          <div class="flex items-center mb-4">
            <el-icon class="text-2xl text-primary mr-3"><Picture /></el-icon>
            <h3 class="text-lg font-medium">Instagram投稿</h3>
          </div>
          <p class="text-sm text-gray-600">予約済み投稿: 3件</p>
        </div>
      </NuxtLink>
      
      <NuxtLink to="/admin/inventory" class="block">
        <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
          <div class="flex items-center mb-4">
            <el-icon class="text-2xl text-primary mr-3"><Box /></el-icon>
            <h3 class="text-lg font-medium">在庫管理</h3>
          </div>
          <p class="text-sm text-gray-600">要発注商品: 5件</p>
        </div>
      </NuxtLink>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Weekly Revenue Chart -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium">週間売上推移</h2>
          <el-select v-model="selectedPeriod" placeholder="期間選択" size="small">
            <el-option label="今週" value="this-week" />
            <el-option label="先週" value="last-week" />
            <el-option label="今月" value="this-month" />
          </el-select>
        </div>
        
        <div class="h-60">
          <div class="h-full flex items-center justify-center bg-gray-50 rounded">
            <p class="text-gray-500">売上グラフ表示エリア</p>
          </div>
        </div>
      </div>
      
      <!-- Popular Services -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium">人気施術ランキング</h2>
          <NuxtLink to="/admin/sales">
            <el-button type="primary" size="small" plain>詳細を見る</el-button>
          </NuxtLink>
        </div>
        
        <div class="space-y-4">
          <div v-for="service in popularServices" :key="service.name" class="flex items-center">
            <div class="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center text-primary font-bold mr-3">
              {{ service.rank }}
            </div>
            <div class="flex-1">
              <h4 class="font-medium">{{ service.name }}</h4>
              <div class="flex items-center mt-1">
                <div class="flex-1 h-2 bg-gray-100 rounded-full mr-3">
                  <div
                    class="h-full bg-primary rounded-full"
                    :style="{ width: `${service.percentage}%` }"
                  ></div>
                </div>
                <span class="text-sm text-gray-500">{{ service.count }}件</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Calendar, Picture, Box } from '@element-plus/icons-vue';

const selectedPeriod = ref('this-week');

const recentCustomers = ref([
  { id: 1, name: '田中 優子', service: 'ジェルネイル', time: '14:30' },
  { id: 2, name: '鈴木 明', service: 'ネイルケア', time: '13:15' },
  { id: 3, name: '渡辺 美緒', service: 'ネイルケア＆補修', time: '11:45' },
  { id: 4, name: '佐藤 花子', service: 'フレンチネイル', time: '10:30' }
]);

const recentCounselingForms = ref([
  { id: 1, customerName: '小林 愛子', service: 'ジェルネイル', timeAgo: '10分前' },
  { id: 2, customerName: '中村 由衣', service: 'ネイルケア', timeAgo: '25分前' },
  { id: 3, customerName: '加藤 理沙', service: 'ネイル延長', timeAgo: '1時間前' },
  { id: 4, customerName: '伊藤 桃子', service: 'ハンドケア', timeAgo: '2時間前' }
]);

const popularServices = ref([
  { rank: 1, name: 'ジェルネイル', count: 42, percentage: 85 },
  { rank: 2, name: 'ネイルケア', count: 38, percentage: 76 },
  { rank: 3, name: 'フットケア', count: 25, percentage: 50 },
  { rank: 4, name: 'ハンドケア', count: 18, percentage: 36 },
  { rank: 5, name: 'ネイル延長', count: 15, percentage: 30 }
]);
</script>

<style scoped>
.el-table {
  --el-table-border-color: theme('colors.gray.200');
  --el-table-header-bg-color: theme('colors.gray.50');
}
</style>