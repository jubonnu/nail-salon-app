<template>
  <div class="bg-white rounded-lg shadow">
    <!-- 検索とフィルター -->
    <div class="p-4 border-b">
      <div class="flex flex-wrap gap-4">
        <el-input
          v-model="searchQuery"
          placeholder="名前や電話番号で検索..."
          class="max-w-xs"
          clearable
          @input="filterSheets"
        >
          <template #prefix>
            <i class="el-icon-search"></i>
          </template>
        </el-input>
        
        <el-select 
          v-model="serviceFilter" 
          placeholder="施術内容" 
          clearable
          @change="filterSheets"
        >
          <el-option label="ジェルネイル" value="ジェルネイル" />
          <el-option label="ネイルケア" value="ネイルケア" />
          <el-option label="ネイルアート" value="ネイルアート" />
          <el-option label="ハンドケア" value="ハンドケア" />
        </el-select>
        
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="〜"
          start-placeholder="開始日"
          end-placeholder="終了日"
          @change="filterSheets"
        />
      </div>
    </div>
    
    <!-- シート一覧 -->
    <el-table
      :data="filteredSheets"
      style="width: 100%"
      v-loading="loading"
      empty-text="カウンセリングシートが見つかりません"
    >
      <el-table-column prop="customerName" label="お客様名" min-width="150" />
      <el-table-column prop="phone" label="電話番号" min-width="130" />
      <el-table-column prop="serviceType" label="施術内容" min-width="120" />
      <el-table-column prop="submissionDate" label="提出日時" min-width="180" sortable />
      <el-table-column fixed="right" label="操作" width="200">
        <template #default="scope">
          <el-button link type="primary" @click="$emit('view', scope.row)">詳細</el-button>
          <el-button 
            v-if="scope.row.status === 'New'" 
            link 
            type="success" 
            @click="$emit('process', scope.row)"
          >
            処理
          </el-button>
          <el-button 
            v-if="scope.row.status === 'Processed'" 
            link 
            type="warning" 
            @click="$emit('archive', scope.row)"
          >
            アーカイブ
          </el-button>
          <el-button link type="danger" @click="$emit('delete', scope.row)">削除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- ページネーション -->
    <div class="flex justify-end p-4">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        :total="totalSheets"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  sheets: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['view', 'process', 'archive', 'delete']);

// State
const searchQuery = ref('');
const serviceFilter = ref('');
const dateRange = ref(null);
const currentPage = ref(1);
const pageSize = ref(10);

// Computed
const filteredSheets = computed(() => {
  return props.sheets;
});

const totalSheets = computed(() => {
  return filteredSheets.value.length;
});

// Methods
const filterSheets = () => {
  // 実装時にはフィルター処理やAPIコールを行う
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  // 新しいページサイズでデータを取得
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  // 新しいページのデータを取得
};

// シートが変更されたらページをリセット
watch(() => props.sheets, () => {
  currentPage.value = 1;
});
</script>