<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">売上・レポート</h1>
      <div class="flex gap-2">
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
          <span class="text-2xl font-bold">¥384,500</span>
          <span class="text-sm text-success">+12.5% ↑</span>
        </div>
        <div class="mt-2">
          <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-primary" style="width: 75%"></div>
          </div>
          <p class="text-xs text-gray-500 mt-1">月間目標の75%達成</p>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-1">来店客数</h3>
        <div class="flex items-end justify-between">
          <span class="text-2xl font-bold">142</span>
          <span class="text-sm text-success">+8.3% ↑</span>
        </div>
        <div class="mt-2">
          <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-primary" style="width: 68%"></div>
          </div>
          <p class="text-xs text-gray-500 mt-1">月間目標の68%達成</p>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-1">平均客単価</h3>
        <div class="flex items-end justify-between">
          <span class="text-2xl font-bold">¥7,250</span>
          <span class="text-sm text-success">+3.2% ↑</span>
        </div>
        <div class="mt-2">
          <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-primary" style="width: 92%"></div>
          </div>
          <p class="text-xs text-gray-500 mt-1">目標単価の92%達成</p>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-1">新規顧客数</h3>
        <div class="flex items-end justify-between">
          <span class="text-2xl font-bold">28</span>
          <span class="text-sm text-error">-5.2% ↓</span>
        </div>
        <div class="mt-2">
          <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-warning" style="width: 56%"></div>
          </div>
          <p class="text-xs text-gray-500 mt-1">月間目標の56%達成</p>
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
        <el-table-column prop="customer" label="お客様名" />
        <el-table-column prop="service" label="施術内容" />
        <el-table-column prop="staff" label="担当スタッフ" />
        <el-table-column prop="amount" label="金額" />
        <el-table-column prop="paymentMethod" label="支払方法" />
        <el-table-column fixed="right" label="操作" width="120">
          <template #default>
            <el-button link type="primary" size="small">詳細</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// State variables
const dateRangeType = ref('month');
const customDateRange = ref(null);
const chartType = ref('daily');

// サンプルデータ
const topServices = ref([
  { service: 'ジェルネイルアート', revenue: '¥158,400', customers: 48, trend: 12.5 },
  { service: 'ネイルケア', revenue: '¥86,200', customers: 52, trend: 5.8 },
  { service: 'ネイルケア＆補修', revenue: '¥64,800', customers: 36, trend: -2.3 },
  { service: 'ジェル延長', revenue: '¥48,600', customers: 18, trend: 8.7 },
  { service: 'フレンチネイル', revenue: '¥26,500', customers: 15, trend: 3.2 }
]);

const recentSales = ref([
  { date: '2024-04-03 14:30', customer: '田中 優子', service: 'ジェルネイルアート', staff: '山田 愛子', amount: '¥8,500', paymentMethod: 'クレジットカード' },
  { date: '2024-04-03 13:15', customer: '鈴木 明', service: 'ネイルケア', staff: '加藤 芽衣', amount: '¥4,800', paymentMethod: '現金' },
  { date: '2024-04-03 11:45', customer: '渡辺 美緒', service: 'ネイルケア＆補修', staff: '山田 愛子', amount: '¥5,200', paymentMethod: 'クレジットカード' },
  { date: '2024-04-03 10:30', customer: '佐藤 花子', service: 'フレンチネイル', staff: '伊藤 由美', amount: '¥6,500', paymentMethod: 'モバイル決済' },
  { date: '2024-04-02 16:00', customer: '山本 恵子', service: 'ジェル延長', staff: '加藤 芽衣', amount: '¥9,800', paymentMethod: 'クレジットカード' }
]);

// メソッド
const updateDateRange = () => {
  if (dateRangeType.value !== 'custom') {
    // 選択に基づいて期間を設定
    const today = new Date();
    
    switch (dateRangeType.value) {
      case 'today':
        customDateRange.value = [today, today];
        break;
      case 'week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        customDateRange.value = [startOfWeek, endOfWeek];
        break;
      case 'month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        customDateRange.value = [startOfMonth, endOfMonth];
        break;
      case 'year':
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        customDateRange.value = [startOfYear, endOfYear];
        break;
    }
    
    loadSalesData();
  }
};

const loadSalesData = () => {
  // 期間に基づいてデータを取得
  console.log('期間のデータを読み込み:', customDateRange.value);
  
  // サンプルデータを使用
};

const exportReport = () => {
  // レポートファイルを生成してダウンロード
  console.log('レポート出力...');
};

const generateCustomReport = () => {
  // カスタムレポート設定ダイアログを表示
  console.log('カスタムレポート生成...');
};

// 初期データの読み込み
updateDateRange();
</script>