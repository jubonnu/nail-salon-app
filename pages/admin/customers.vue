<template>
    <div>
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">顧客管理</h1>
            <el-button type="primary" @click="showAddCustomerDialog = true">
                新規顧客登録
            </el-button>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
            <!-- Search and Filter Bar -->
            <div class="flex flex-wrap gap-4 mb-6">
                <el-input
                    v-model="searchQuery"
                    placeholder="顧客検索..."
                    class="max-w-xs"
                    clearable
                    @clear="handleSearch"
                >
                    <template #prefix>
                        <el-icon><i class="el-icon-search"></i></el-icon>
                    </template>
                </el-input>

                <el-select
                    v-model="filterVisitCount"
                    placeholder="来店頻度"
                    clearable
                >
                    <el-option label="初回" value="first-time" />
                    <el-option label="リピーター (2-5回)" value="regular" />
                    <el-option label="常連 (6回以上)" value="frequent" />
                </el-select>

                <el-select
                    v-model="filterService"
                    placeholder="施術内容"
                    clearable
                >
                    <el-option label="ジェルネイル" value="gel" />
                    <el-option label="ネイルケア" value="regular" />
                    <el-option label="ネイルアート" value="art" />
                    <el-option label="ハンドケア" value="care" />
                </el-select>

                <el-button type="primary" plain @click="handleSearch"
                    >検索</el-button
                >
                <el-button @click="resetFilters">リセット</el-button>
            </div>

            <!-- Customer Table -->
            <el-table
                :data="paginatedCustomers"
                style="width: 100%"
                border
                v-loading="loading"
            >
                <el-table-column label="ID" width="80">
                    <template #default="scope">
                        {{ getDisplayIndex(scope.$index) }}
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="お客様名" min-width="150" />
                <el-table-column
                    prop="phone"
                    label="電話番号"
                    min-width="130"
                />
                <el-table-column
                    prop="email"
                    label="メールアドレス"
                    min-width="200"
                />
                <el-table-column
                    prop="visitCount"
                    label="来店回数"
                    width="110"
                    sortable
                />
                <el-table-column
                    prop="lastVisit"
                    label="前回来店日"
                    min-width="130"
                    sortable
                />
                <el-table-column
                    prop="preferredService"
                    label="よく利用する施術"
                    min-width="150"
                />
                <el-table-column fixed="right" label="操作" width="150">
                    <template #default="scope">
                        <el-button
                            link
                            type="primary"
                            @click="viewCustomer(scope.row)"
                            >詳細</el-button
                        >
                        <el-button
                            link
                            type="primary"
                            @click="editCustomer(scope.row)"
                            >編集</el-button
                        >
                    </template>
                </el-table-column>
            </el-table>

            <!-- Pagination -->
            <div class="flex justify-end mt-4">
                <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next"
                    :total="totalCustomers"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </div>

        <!-- Add Customer Dialog -->
        <el-dialog
            v-model="showAddCustomerDialog"
            title="新規顧客登録"
            width="500px"
        >
            <el-form
                :model="newCustomer"
                label-position="top"
                :rules="customerRules"
                ref="customerFormRef"
            >
                <el-form-item label="お名前" prop="name">
                    <el-input v-model="newCustomer.name" />
                </el-form-item>

                <el-form-item label="電話番号" prop="phone">
                    <el-input v-model="newCustomer.phone" />
                </el-form-item>

                <el-form-item label="メールアドレス" prop="email">
                    <el-input v-model="newCustomer.email" />
                </el-form-item>

                <el-form-item label="よく利用する施術" prop="preferredService">
                    <el-select
                        v-model="newCustomer.preferredService"
                        placeholder="施術を選択"
                        class="w-full"
                    >
                        <el-option label="ジェルネイル" value="ジェルネイル" />
                        <el-option label="ネイルケア" value="ネイルケア" />
                        <el-option label="ネイルアート" value="ネイルアート" />
                        <el-option label="ハンドケア" value="ハンドケア" />
                    </el-select>
                </el-form-item>

                <el-form-item label="備考" prop="notes">
                    <el-input
                        type="textarea"
                        v-model="newCustomer.notes"
                        rows="3"
                    />
                </el-form-item>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="showAddCustomerDialog = false"
                        >キャンセル</el-button
                    >
                    <el-button
                        type="primary"
                        @click="addCustomer"
                        :loading="addingCustomer"
                        >登録</el-button
                    >
                </span>
            </template>
        </el-dialog>

        <!-- View Customer Drawer -->
        <el-drawer
            v-model="showCustomerDrawer"
            title="顧客詳細"
            direction="rtl"
            size="500px"
        >
            <div class="p-4" v-if="selectedCustomer">
                <div class="flex items-center mb-6">
                    <div
                        class="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mr-4"
                    >
                        {{
                            selectedCustomer.name
                                ? selectedCustomer.name.charAt(0)
                                : "?"
                        }}
                    </div>
                    <div>
                        <h3 class="text-xl font-bold">
                            {{ selectedCustomer.name }}
                        </h3>
                        <p class="text-gray-500">
                            初回来店: {{ selectedCustomer.joinDate }}
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div class="bg-gray-50 p-3 rounded">
                        <p class="text-sm text-gray-500">電話番号</p>
                        <p>{{ selectedCustomer.phone }}</p>
                    </div>
                    <div class="bg-gray-50 p-3 rounded">
                        <p class="text-sm text-gray-500">メールアドレス</p>
                        <p>{{ selectedCustomer.email }}</p>
                    </div>
                    <div class="bg-gray-50 p-3 rounded">
                        <p class="text-sm text-gray-500">来店回数</p>
                        <p>{{ selectedCustomer.visitCount }}</p>
                    </div>
                    <div class="bg-gray-50 p-3 rounded">
                        <p class="text-sm text-gray-500">前回来店日</p>
                        <p>{{ selectedCustomer.lastVisit }}</p>
                    </div>
                </div>

                <div class="mb-6">
                    <h4 class="font-medium mb-2">よく利用する施術</h4>
                    <el-tag class="mr-2 mb-2">{{
                        selectedCustomer.preferredService
                    }}</el-tag>
                </div>

                <div class="mb-6">
                    <h4 class="font-medium mb-2">備考</h4>
                    <p class="text-gray-700 bg-gray-50 p-3 rounded">
                        {{ selectedCustomer.notes || "備考なし" }}
                    </p>
                </div>

                <div>
                    <h4 class="font-medium mb-2">来店履歴</h4>
                    <el-timeline>
                        <el-timeline-item
                            v-for="(visit, index) in recentVisits"
                            :key="index"
                            :timestamp="visit.date"
                            :color="index === 0 ? 'var(--color-primary)' : ''"
                        >
                            {{ visit.service }}
                            <p class="text-sm text-gray-500 mt-1">
                                {{ visit.note }}
                            </p>
                        </el-timeline-item>
                    </el-timeline>
                </div>

                <div class="flex justify-end mt-6 space-x-2">
                    <el-button
                        type="primary"
                        @click="editCustomer(selectedCustomer)"
                        >顧客情報編集</el-button
                    >
                    <el-button
                        type="primary"
                        plain
                        @click="createCounselingSheet(selectedCustomer)"
                        >カウンセリングシート作成</el-button
                    >
                </div>
            </div>
        </el-drawer>
    </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useCustomerStore } from "~/stores/customers";

const customerStore = useCustomerStore();

// State variables
const searchQuery = ref("");
const filterVisitCount = ref("");
const filterService = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const showAddCustomerDialog = ref(false);
const showCustomerDrawer = ref(false);
const selectedCustomer = ref(null);
const addingCustomer = ref(false);
const customerFormRef = ref(null);

// Recent visits for selected customer
const recentVisits = ref([
    { date: "2024-04-02", service: "ジェルネイル", note: "春らしい桜デザイン" },
    { date: "2024-03-01", service: "ネイルケア", note: "キューティクルケア" },
    { date: "2024-02-05", service: "ジェルネイル", note: "フレンチネイル" },
    { date: "2024-01-10", service: "ネイルケア", note: "ディープレッドカラー" },
]);

// New customer form model
const newCustomer = reactive({
    name: "",
    phone: "",
    email: "",
    preferredService: "",
    notes: "",
});

// Validation rules
const customerRules = {
    name: [
        {
            required: true,
            message: "お名前を入力してください",
            trigger: "blur",
        },
    ],
    phone: [
        {
            required: true,
            message: "電話番号を入力してください",
            trigger: "blur",
        },
    ],
    email: [
        {
            type: "email",
            message: "有効なメールアドレスを入力してください",
            trigger: "blur",
        },
    ],
};

const error = computed(() => customerStore.error);
const customers = computed(() => customerStore.customers);

// Computed properties
const filteredCustomers = computed(() => {
    let customers = [...customerStore.customers];

    // 検索フィルター
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        customers = customers.filter(
            (customer) =>
                customer.name?.toLowerCase().includes(query) ||
                customer.email?.toLowerCase().includes(query) ||
                customer.phone?.includes(query)
        );
    }

    // 来店回数フィルター
    if (filterVisitCount.value) {
        customers = customers.filter((customer) => {
            const visits = customer.visitCount || 0;
            switch (filterVisitCount.value) {
                case "first-time":
                    return visits === 1;
                case "regular":
                    return visits >= 2 && visits <= 5;
                case "frequent":
                    return visits >= 6;
                default:
                    return true;
            }
        });
    }

    // 施術内容フィルター
    if (filterService.value) {
        customers = customers.filter(
            (customer) => customer.preferredService === filterService.value
        );
    }

    return customers;
});

// Computed properties for pagination
const totalCustomers = computed(() => filteredCustomers.value.length);

const paginatedCustomers = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredCustomers.value.slice(start, end);
});

// Methods
const getDisplayIndex = (index) => {
    return index + 1 + (currentPage.value - 1) * pageSize.value;
};

const handleSizeChange = (val) => {
    pageSize.value = val;
    currentPage.value = 1;
};

const handleCurrentChange = (val) => {
    currentPage.value = val;
};

const handleSearch = () => {
    currentPage.value = 1;
};

const resetFilters = () => {
    searchQuery.value = "";
    filterVisitCount.value = "";
    filterService.value = "";
    currentPage.value = 1;
};

const viewCustomer = (customer) => {
    selectedCustomer.value = customer;
    showCustomerDrawer.value = true;
};

const editCustomer = (customer) => {
    // Would open edit dialog in full implementation
    console.log("顧客情報編集:", customer);
};

const addCustomer = async () => {
    if (!customerFormRef.value) return;

    await customerFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                await customerStore.createCustomer({
                    name: newCustomer.name,
                    email: newCustomer.email,
                    phone: newCustomer.phone,
                    notes: newCustomer.notes,
                });

                ElMessage.success("顧客を登録しました");

                // Reset form and close dialog
                Object.keys(newCustomer).forEach((key) => {
                    newCustomer[key] = "";
                });

                showAddCustomerDialog.value = false;
            } catch (error) {
                console.error("顧客登録エラー:", error);
                ElMessage.error("顧客の登録に失敗しました");
            } finally {
                addingCustomer.value = false;
            }
        }
    });
};

// Load initial data
onMounted(async () => {
    loading.value = true;
    try {
        await customerStore.fetchCustomers();
    } catch (error) {
        ElMessage.error("顧客データの取得に失敗しました");
    } finally {
        loading.value = false;
    }
});

const createCounselingSheet = (customer) => {
    // Would navigate to counseling form in full implementation
    console.log("カウンセリングシート作成:", customer);
};
</script>
