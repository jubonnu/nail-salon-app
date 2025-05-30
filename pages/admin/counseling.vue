<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">カウンセリングシート管理</h1>
      <el-button type="primary" @click="createNewSheet">
        新規作成
      </el-button>
    </div>
    
    <!-- ステータス別タブ -->
    <el-tabs v-model="activeTab" class="counseling-tabs" @tab-click="handleTabChange">
      <el-tab-pane label="新規提出" name="new">
        <counseling-sheet-list 
          :sheets="newSheets" 
          :loading="loading"
          @view="viewSheet"
          @process="processSheet"
          @delete="confirmDeleteSheet"
        />
      </el-tab-pane>
      
      <el-tab-pane label="処理済み" name="processed">
        <counseling-sheet-list 
          :sheets="processedSheets" 
          :loading="loading"
          @view="viewSheet"
          @process="processSheet"
          @delete="confirmDeleteSheet"
        />
      </el-tab-pane>
      
      <el-tab-pane label="アーカイブ済み" name="archived">
        <counseling-sheet-list 
          :sheets="archivedSheets" 
          :loading="loading"
          @view="viewSheet"
          @process="processSheet"
          @delete="confirmDeleteSheet"
        />
      </el-tab-pane>
    </el-tabs>
    
    <!-- シート詳細ドロワー -->
    <el-drawer
      v-model="showSheetDrawer"
      title="カウンセリングシート詳細"
      direction="rtl"
      size="50%"
    >
      <div class="p-4" v-if="selectedSheet">
        <div class="mb-6 flex justify-between items-center">
          <div>
            <h3 class="text-xl font-bold">{{ selectedSheet.customerName }}</h3>
            <p class="text-gray-500">提出日時: {{ selectedSheet.submissionDate }}</p>
          </div>
          <el-tag :type="getStatusType(selectedSheet.status)">{{ getStatusLabel(selectedSheet.status) }}</el-tag>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 class="font-medium mb-3">基本情報</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">電話番号</p>
              <p>{{ selectedSheet.phone }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">メールアドレス</p>
              <p>{{ selectedSheet.email || '未登録' }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 class="font-medium mb-3">施術希望</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-sm text-gray-500">施術内容</p>
              <p>{{ selectedSheet.serviceType }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">長さ</p>
              <p class="capitalize">{{ getNailLengthLabel(selectedSheet.nailLength) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">形</p>
              <p class="capitalize">{{ getNailShapeLabel(selectedSheet.nailShape) }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 class="font-medium mb-3">健康状態</h4>
          <div class="mb-4">
            <p class="text-sm text-gray-500">アレルギー</p>
            <p>{{ selectedSheet.hasAllergies ? 'あり' : 'なし' }}</p>
            <p v-if="selectedSheet.hasAllergies" class="mt-2 text-sm bg-white p-2 rounded">
              {{ selectedSheet.allergiesDetails }}
            </p>
          </div>
          
          <div>
            <p class="text-sm text-gray-500">既往歴</p>
            <p>{{ selectedSheet.hasMedicalConditions ? 'あり' : 'なし' }}</p>
            <p v-if="selectedSheet.hasMedicalConditions" class="mt-2 text-sm bg-white p-2 rounded">
              {{ selectedSheet.medicalDetails }}
            </p>
          </div>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 class="font-medium mb-3">その他</h4>
          <p>{{ selectedSheet.notes || '特記事項なし' }}</p>
        </div>
        
        <div class="flex justify-end space-x-2">
          <el-button v-if="selectedSheet.status === 'New'" type="primary" @click="processSheet(selectedSheet)">
            処理する
          </el-button>
          <el-button v-if="selectedSheet.status === 'Processed'" type="warning" @click="archiveSheet(selectedSheet)">
            アーカイブ
          </el-button>
          <el-button type="danger" plain @click="confirmDeleteSheet(selectedSheet)">
            削除
          </el-button>
        </div>
      </div>
    </el-drawer>
    
    <!-- 削除確認ダイアログ -->
    <el-dialog
      v-model="showDeleteDialog"
      title="削除の確認"
      width="400px"
    >
      <p>このカウンセリングシートを削除してもよろしいですか？この操作は取り消せません。</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDeleteDialog = false">キャンセル</el-button>
          <el-button type="danger" @click="deleteSheet" :loading="deletingSheet">削除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeTab = ref('new');
const loading = ref(true);
const showSheetDrawer = ref(false);
const showDeleteDialog = ref(false);
const selectedSheet = ref(null);
const sheetToDelete = ref(null);
const deletingSheet = ref(false);

// サンプルデータ
const newSheets = ref([]);
const processedSheets = ref([]);
const archivedSheets = ref([]);

// メソッド
const createNewSheet = () => {
  router.push('/admin/counseling/create');
};

const handleTabChange = () => {
  loading.value = true;
  
  // API呼び出しのシミュレーション
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const viewSheet = (sheet) => {
  selectedSheet.value = sheet;
  showSheetDrawer.value = true;
};

const processSheet = (sheet) => {
  if (sheet.status === 'New') {
    const index = newSheets.value.findIndex(s => s.id === sheet.id);
    if (index !== -1) {
      const updatedSheet = { ...newSheets.value[index], status: 'Processed' };
      processedSheets.value.unshift(updatedSheet);
      newSheets.value.splice(index, 1);
      
      if (selectedSheet.value && selectedSheet.value.id === sheet.id) {
        selectedSheet.value = updatedSheet;
      }
    }
  }
};

const archiveSheet = (sheet) => {
  if (sheet.status === 'Processed') {
    const index = processedSheets.value.findIndex(s => s.id === sheet.id);
    if (index !== -1) {
      const updatedSheet = { ...processedSheets.value[index], status: 'Archived' };
      archivedSheets.value.unshift(updatedSheet);
      processedSheets.value.splice(index, 1);
      
      if (selectedSheet.value && selectedSheet.value.id === sheet.id) {
        selectedSheet.value = updatedSheet;
      }
    }
  }
};

const confirmDeleteSheet = (sheet) => {
  sheetToDelete.value = sheet;
  showDeleteDialog.value = true;
};

const deleteSheet = async () => {
  if (!sheetToDelete.value) return;
  
  deletingSheet.value = true;
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const sheet = sheetToDelete.value;
    let sourceList;
    
    if (sheet.status === 'New') {
      sourceList = newSheets;
    } else if (sheet.status === 'Processed') {
      sourceList = processedSheets;
    } else {
      sourceList = archivedSheets;
    }
    
    const index = sourceList.value.findIndex(s => s.id === sheet.id);
    if (index !== -1) {
      sourceList.value.splice(index, 1);
    }
    
    showDeleteDialog.value = false;
    if (selectedSheet.value && selectedSheet.value.id === sheet.id) {
      showSheetDrawer.value = false;
    }
  } catch (error) {
    console.error('シート削除エラー:', error);
  } finally {
    deletingSheet.value = false;
  }
};

const getStatusType = (status) => {
  switch (status) {
    case 'New':
      return 'success';
    case 'Processed':
      return 'primary';
    case 'Archived':
      return 'info';
    default:
      return '';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'New':
      return '新規';
    case 'Processed':
      return '処理済み';
    case 'Archived':
      return 'アーカイブ済み';
    default:
      return status;
  }
};

const getNailLengthLabel = (length) => {
  switch (length) {
    case 'short':
      return '短め';
    case 'medium':
      return '普通';
    case 'long':
      return '長め';
    default:
      return length;
  }
};

const getNailShapeLabel = (shape) => {
  switch (shape) {
    case 'square':
      return 'スクエア';
    case 'round':
      return 'ラウンド';
    case 'oval':
      return 'オーバル';
    case 'almond':
      return 'アーモンド';
    case 'stiletto':
      return 'スティレット';
    case 'coffin':
      return 'コフィン';
    default:
      return shape;
  }
};

// 初期データの読み込み
onMounted(() => {
  setTimeout(() => {
    newSheets.value = [
      {
        id: 1,
        customerName: '小林 愛子',
        phone: '070-1234-8765',
        email: 'kobayashi.aiko@example.com',
        serviceType: 'ジェルネイル',
        nailLength: 'medium',
        nailShape: 'almond',
        hasAllergies: false,
        allergiesDetails: '',
        hasMedicalConditions: false,
        medicalDetails: '',
        notes: 'パステルカラーでシンプルなデザインを希望。',
        status: 'New',
        submissionDate: '2024-04-03 14:30'
      },
      {
        id: 2,
        customerName: '中村 由衣',
        phone: '090-8765-1234',
        email: 'nakamura.yui@example.com',
        serviceType: 'ネイルケア',
        nailLength: 'short',
        nailShape: 'square',
        hasAllergies: true,
        allergiesDetails: 'アクリル製品にアレルギーあり。',
        hasMedicalConditions: false,
        medicalDetails: '',
        notes: 'シンプルで清潔感のあるデザインを希望。',
        status: 'New',
        submissionDate: '2024-04-03 13:15'
      },
      {
        id: 3,
        customerName: '加藤 理沙',
        phone: '080-2468-9753',
        email: 'kato.risa@example.com',
        serviceType: 'ネイルアート',
        nailLength: 'long',
        nailShape: 'stiletto',
        hasAllergies: false,
        allergiesDetails: '',
        hasMedicalConditions: false,
        medicalDetails: '',
        notes: '桜をモチーフにしたネイルアートを希望。',
        status: 'New',
        submissionDate: '2024-04-03 11:45'
      }
    ];
    
    processedSheets.value = [
      {
        id: 4,
        customerName: '田中 優子',
        phone: '090-1234-5678',
        email: 'tanaka.yuki@example.com',
        serviceType: 'ジェルネイル',
        nailLength: 'medium',
        nailShape: 'oval',
        hasAllergies: false,
        allergiesDetails: '',
        hasMedicalConditions: false,
        medicalDetails: '',
        notes: 'ピンクとホワイトのカラーを希望。',
        status: 'Processed',
        submissionDate: '2024-04-02 16:00'
      },
      {
        id: 5,
        customerName: '鈴木 明',
        phone: '080-8765-4321',
        email: 'suzuki.akira@example.com',
        serviceType: 'ネイルケア',
        nailLength: 'short',
        nailShape: 'round',
        hasAllergies: false,
        allergiesDetails: '',
        hasMedicalConditions: false,
        medicalDetails: '',
        notes: '短時間での施術を希望。',
        status: 'Processed',
        submissionDate: '2024-04-01 10:30'
      }
    ];
    
    archivedSheets.value = [
      {
        id: 6,
        customerName: '渡辺 美緒',
        phone: '070-2468-1357',
        email: 'watanabe.mio@example.com',
        serviceType: 'ネイルアート',
        nailLength: 'medium',
        nailShape: 'coffin',
        hasAllergies: true,
        allergiesDetails: '強い接着剤に敏感。',
        hasMedicalConditions: false,
        medicalDetails: '',
        notes: '細かいネイルアートデザインを希望。',
        status: 'Archived',
        submissionDate: '2024-03-25 14:00'
      }
    ];
    
    loading.value = false;
  }, 1000);
});
</script>

<style scoped>
.counseling-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 20px;
}
</style>