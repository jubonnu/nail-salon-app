<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">在庫管理</h1>
      <div class="flex gap-2">
        <el-button @click="showOrderDialog = true">
          発注登録
        </el-button>
        <el-button type="primary" @click="showProductDialog = true">
          新規商品登録
        </el-button>
      </div>
    </div>

    <!-- 在庫一覧 -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex flex-wrap gap-4 mb-4">
        <el-input
          v-model="searchQuery"
          placeholder="商品名で検索..."
          class="max-w-xs"
          clearable
        >
          <template #prefix>
            <i class="el-icon-search"></i>
          </template>
        </el-input>

        <el-select v-model="categoryFilter" placeholder="カテゴリー" clearable>
          <el-option label="ジェル" value="ジェル" />
          <el-option label="ケア用品" value="ケア用品" />
          <el-option label="アート用品" value="アート用品" />
          <el-option label="機器" value="機器" />
        </el-select>

        <el-select v-model="stockFilter" placeholder="在庫状況" clearable>
          <el-option label="在庫あり" value="inStock" />
          <el-option label="在庫少" value="low" />
          <el-option label="在庫切れ" value="outOfStock" />
        </el-select>
      </div>

      <el-table :data="filteredProducts" style="width: 100%">
        <el-table-column prop="name" label="商品名" min-width="200" />
        <el-table-column prop="category" label="カテゴリー" width="120" />
        <el-table-column prop="brand" label="ブランド" width="120" />
        <el-table-column label="在庫数" width="120" align="right">
          <template #default="scope">
            <span :class="{
              'text-error': scope.row.quantity <= scope.row.minimumStock,
              'text-warning': scope.row.quantity <= scope.row.minimumStock * 2
            }">
              {{ scope.row.quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="単位" width="80" />
        <el-table-column label="状態" width="120">
          <template #default="scope">
            <el-tag :type="getStockStatusType(scope.row)">
              {{ getStockStatusLabel(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-button link type="primary" @click="useProduct(scope.row)">使用</el-button>
            <el-button link type="primary" @click="editProduct(scope.row)">編集</el-button>
            <el-button link type="danger" @click="confirmDeleteProduct(scope.row)">削除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 発注履歴 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-medium mb-4">発注履歴</h2>
      <el-table :data="orders" style="width: 100%">
        <el-table-column prop="date" label="発注日" width="180" />
        <el-table-column prop="product" label="商品名" />
        <el-table-column prop="quantity" label="数量" width="100" align="right" />
        <el-table-column prop="status" label="状態" width="120">
          <template #default="scope">
            <el-tag :type="getOrderStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="expectedDate" label="入荷予定日" width="180" />
      </el-table>
    </div>

    <!-- 商品登録/編集ダイアログ -->
    <el-dialog
      v-model="showProductDialog"
      :title="editingProduct ? '商品編集' : '新規商品登録'"
      width="500px"
    >
      <el-form :model="productForm" :rules="productRules" ref="productFormRef" label-position="top">
        <el-form-item label="商品名" prop="name">
          <el-input v-model="productForm.name" />
        </el-form-item>

        <el-form-item label="カテゴリー" prop="category">
          <el-select v-model="productForm.category" class="w-full">
            <el-option label="ジェル" value="ジェル" />
            <el-option label="ケア用品" value="ケア用品" />
            <el-option label="アート用品" value="アート用品" />
            <el-option label="機器" value="機器" />
          </el-select>
        </el-form-item>

        <el-form-item label="ブランド" prop="brand">
          <el-input v-model="productForm.brand" />
        </el-form-item>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="在庫数" prop="quantity">
            <el-input-number v-model="productForm.quantity" :min="0" class="w-full" />
          </el-form-item>

          <el-form-item label="単位" prop="unit">
            <el-input v-model="productForm.unit" />
          </el-form-item>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="最小在庫数" prop="minimumStock">
            <el-input-number v-model="productForm.minimumStock" :min="0" class="w-full" />
          </el-form-item>

          <el-form-item label="発注ロット" prop="orderLot">
            <el-input-number v-model="productForm.orderLot" :min="1" class="w-full" />
          </el-form-item>
        </div>

        <el-form-item label="備考" prop="notes">
          <el-input type="textarea" v-model="productForm.notes" rows="3" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showProductDialog = false">キャンセル</el-button>
          <el-button type="primary" @click="saveProduct">
            {{ editingProduct ? '更新' : '登録' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 発注登録ダイアログ -->
    <el-dialog
      v-model="showOrderDialog"
      title="発注登録"
      width="500px"
    >
      <el-form :model="orderForm" :rules="orderRules" ref="orderFormRef" label-position="top">
        <el-form-item label="商品" prop="product">
          <el-select v-model="orderForm.product" class="w-full" filterable>
            <el-option
              v-for="product in products"
              :key="product.id"
              :label="product.name"
              :value="product.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="orderForm.quantity" :min="1" class="w-full" />
        </el-form-item>

        <el-form-item label="入荷予定日" prop="expectedDate">
          <el-date-picker
            v-model="orderForm.expectedDate"
            type="date"
            placeholder="日付を選択"
            class="w-full"
          />
        </el-form-item>

        <el-form-item label="備考" prop="notes">
          <el-input type="textarea" v-model="orderForm.notes" rows="3" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showOrderDialog = false">キャンセル</el-button>
          <el-button type="primary" @click="saveOrder">発注する</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 商品使用ダイアログ -->
    <el-dialog
      v-model="showUseDialog"
      title="商品使用登録"
      width="400px"
    >
      <el-form :model="useForm" :rules="useRules" ref="useFormRef" label-position="top">
        <el-form-item label="使用数" prop="quantity">
          <el-input-number
            v-model="useForm.quantity"
            :min="1"
            :max="selectedProduct ? selectedProduct.quantity : 1"
            class="w-full"
          />
        </el-form-item>

        <el-form-item label="備考" prop="notes">
          <el-input type="textarea" v-model="useForm.notes" rows="3" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUseDialog = false">キャンセル</el-button>
          <el-button type="primary" @click="registerUse">登録</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 削除確認ダイアログ -->
    <el-dialog
      v-model="showDeleteDialog"
      title="商品削除の確認"
      width="400px"
    >
      <p>この商品を削除してもよろしいですか？</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDeleteDialog = false">キャンセル</el-button>
          <el-button type="danger" @click="deleteProduct">削除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

// State
const searchQuery = ref('');
const categoryFilter = ref('');
const stockFilter = ref('');
const showProductDialog = ref(false);
const showOrderDialog = ref(false);
const showUseDialog = ref(false);
const showDeleteDialog = ref(false);
const editingProduct = ref(false);
const selectedProduct = ref(null);
const productFormRef = ref(null);
const orderFormRef = ref(null);
const useFormRef = ref(null);

// Form models
const productForm = reactive({
  name: '',
  category: '',
  brand: '',
  quantity: 0,
  unit: '',
  minimumStock: 0,
  orderLot: 1,
  notes: ''
});

const orderForm = reactive({
  product: '',
  quantity: 1,
  expectedDate: null,
  notes: ''
});

const useForm = reactive({
  quantity: 1,
  notes: ''
});

// Validation rules
const productRules = {
  name: [
    { required: true, message: '商品名を入力してください', trigger: 'blur' }
  ],
  category: [
    { required: true, message: 'カテゴリーを選択してください', trigger: 'change' }
  ],
  brand: [
    { required: true, message: 'ブランドを入力してください', trigger: 'blur' }
  ]
};

const orderRules = {
  product: [
    { required: true, message: '商品を選択してください', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '数量を入力してください', trigger: 'blur' }
  ],
  expectedDate: [
    { required: true, message: '入荷予定日を選択してください', trigger: 'change' }
  ]
};

const useRules = {
  quantity: [
    { required: true, message: '使用数を入力してください', trigger: 'blur' }
  ]
};

// Sample data
const products = ref([
  {
    id: 1,
    name: 'クリアジェル',
    category: 'ジェル',
    brand: 'ネイルプロ',
    quantity: 5,
    unit: '個',
    minimumStock: 3,
    orderLot: 5,
    notes: '最も使用頻度の高い商品'
  },
  {
    id: 2,
    name: 'ネイルクリーナー',
    category: 'ケア用品',
    brand: 'ケアプロ',
    quantity: 12,
    unit: '本',
    minimumStock: 5,
    orderLot: 10,
    notes: ''
  },
  {
    id: 3,
    name: 'ラメパウダー',
    category: 'アート用品',
    brand: 'アートプロ',
    quantity: 2,
    unit: '個',
    minimumStock: 3,
    orderLot: 3,
    notes: '人気商品のため在庫確保が必要'
  }
]);

const orders = ref([
  {
    id: 1,
    date: '2024-04-01',
    product: 'クリアジェル',
    quantity: 10,
    status: '発注済み',
    expectedDate: '2024-04-08'
  },
  {
    id: 2,
    date: '2024-04-02',
    product: 'ネイルクリーナー',
    quantity: 20,
    status: '入荷済み',
    expectedDate: '2024-04-05'
  }
]);

// Computed
const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesSearch = !searchQuery.value || 
      product.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    const matchesCategory = !categoryFilter.value || 
      product.category === categoryFilter.value;
    
    const matchesStock = !stockFilter.value || (
      (stockFilter.value === 'inStock' && product.quantity > product.minimumStock * 2) ||
      (stockFilter.value === 'low' && product.quantity <= product.minimumStock * 2 && product.quantity > product.minimumStock) ||
      (stockFilter.value === 'outOfStock' && product.quantity <= product.minimumStock)
    );
    
    return matchesSearch && matchesCategory && matchesStock;
  });
});

// Methods
const getStockStatusType = (product) => {
  if (product.quantity <= product.minimumStock) return 'danger';
  if (product.quantity <= product.minimumStock * 2) return 'warning';
  return 'success';
};

const getStockStatusLabel = (product) => {
  if (product.quantity <= product.minimumStock) return '在庫切れ';
  if (product.quantity <= product.minimumStock * 2) return '在庫少';
  return '在庫あり';
};

const getOrderStatusType = (status) => {
  switch (status) {
    case '発注済み': return 'warning';
    case '入荷済み': return 'success';
    default: return 'info';
  }
};

const editProduct = (product) => {
  editingProduct.value = true;
  Object.assign(productForm, product);
  showProductDialog.value = true;
};

const useProduct = (product) => {
  selectedProduct.value = product;
  useForm.quantity = 1;
  useForm.notes = '';
  showUseDialog.value = true;
};

const confirmDeleteProduct = (product) => {
  selectedProduct.value = product;
  showDeleteDialog.value = true;
};

const saveProduct = async () => {
  if (!productFormRef.value) return;

  await productFormRef.value.validate(async (valid) => {
    if (valid) {
      if (editingProduct.value) {
        const index = products.value.findIndex(p => p.id === selectedProduct.value.id);
        if (index !== -1) {
          products.value[index] = { ...productForm, id: selectedProduct.value.id };
        }
      } else {
        const newProduct = {
          id: products.value.length + 1,
          ...productForm
        };
        products.value.push(newProduct);
      }

      resetProductForm();
      showProductDialog.value = false;
    }
  });
};

const saveOrder = async () => {
  if (!orderFormRef.value) return;

  await orderFormRef.value.validate(async (valid) => {
    if (valid) {
      const newOrder = {
        id: orders.value.length + 1,
        date: new Date().toISOString().split('T')[0],
        ...orderForm,
        status: '発注済み'
      };
      orders.value.unshift(newOrder);

      resetOrderForm();
      showOrderDialog.value = false;
    }
  });
};

const registerUse = async () => {
  if (!useFormRef.value || !selectedProduct.value) return;

  await useFormRef.value.validate(async (valid) => {
    if (valid) {
      const index = products.value.findIndex(p => p.id === selectedProduct.value.id);
      if (index !== -1) {
        products.value[index].quantity -= useForm.quantity;
      }

      showUseDialog.value = false;
      selectedProduct.value = null;
    }
  });
};

const deleteProduct = () => {
  if (!selectedProduct.value) return;

  const index = products.value.findIndex(p => p.id === selectedProduct.value.id);
  if (index !== -1) {
    products.value.splice(index, 1);
  }

  showDeleteDialog.value = false;
  selectedProduct.value = null;
};

const resetProductForm = () => {
  if (productFormRef.value) {
    productFormRef.value.resetFields();
  }
  editingProduct.value = false;
  selectedProduct.value = null;
};

const resetOrderForm = () => {
  if (orderFormRef.value) {
    orderFormRef.value.resetFields();
  }
};
</script>