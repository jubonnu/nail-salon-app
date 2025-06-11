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
                <el-radio-group
                    v-model="dateRangeType"
                    @change="updateDateRange"
                >
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
                    <span class="text-2xl font-bold"
                        >¥{{ summary.totalSales?.toLocaleString() || 0 }}</span
                    >
                    <span
                        class="text-sm"
                        :class="
                            summary.salesTrend >= 0
                                ? 'text-success'
                                : 'text-error'
                        "
                    >
                        {{ summary.salesTrend >= 0 ? "+" : ""
                        }}{{ summary.salesTrend }}%
                        {{ summary.salesTrend >= 0 ? "↑" : "↓" }}
                    </span>
                </div>
                <div class="mt-2">
                    <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            class="h-full bg-primary"
                            :style="{
                                width: `${summary.targetProgress || 0}%`,
                            }"
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
                    <span class="text-2xl font-bold">{{
                        summary.customerCount || 0
                    }}</span>
                    <span
                        class="text-sm"
                        :class="
                            summary.customerTrend >= 0
                                ? 'text-success'
                                : 'text-error'
                        "
                    >
                        {{ summary.customerTrend >= 0 ? "+" : ""
                        }}{{ summary.customerTrend }}%
                        {{ summary.customerTrend >= 0 ? "↑" : "↓" }}
                    </span>
                </div>
                <div class="mt-2">
                    <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            class="h-full bg-primary"
                            :style="{
                                width: `${
                                    summary.customerTargetProgress || 0
                                }%`,
                            }"
                        ></div>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">
                        月間目標の{{ summary.customerTargetProgress || 0 }}%達成
                    </p>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-sm font-medium text-gray-500 mb-1">
                    平均客単価
                </h3>
                <div class="flex items-end justify-between">
                    <span class="text-2xl font-bold"
                        >¥{{
                            summary.averageTransaction?.toLocaleString() || 0
                        }}</span
                    >
                    <span
                        class="text-sm"
                        :class="
                            summary.avgTransactionTrend >= 0
                                ? 'text-success'
                                : 'text-error'
                        "
                    >
                        {{ summary.avgTransactionTrend >= 0 ? "+" : ""
                        }}{{ summary.avgTransactionTrend }}%
                        {{ summary.avgTransactionTrend >= 0 ? "↑" : "↓" }}
                    </span>
                </div>
                <div class="mt-2">
                    <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            class="h-full bg-primary"
                            :style="{
                                width: `${
                                    summary.avgTransactionTargetProgress || 0
                                }%`,
                            }"
                        ></div>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">
                        目標単価の{{
                            summary.avgTransactionTargetProgress || 0
                        }}%達成
                    </p>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-sm font-medium text-gray-500 mb-1">
                    新規顧客数
                </h3>
                <div class="flex items-end justify-between">
                    <span class="text-2xl font-bold">{{
                        summary.newCustomers || 0
                    }}</span>
                    <span
                        class="text-sm"
                        :class="
                            summary.newCustomerTrend >= 0
                                ? 'text-success'
                                : 'text-error'
                        "
                    >
                        {{ summary.newCustomerTrend >= 0 ? "+" : ""
                        }}{{ summary.newCustomerTrend }}%
                        {{ summary.newCustomerTrend >= 0 ? "↑" : "↓" }}
                    </span>
                </div>
                <div class="mt-2">
                    <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            class="h-full"
                            :class="
                                summary.newCustomerTargetProgress >= 70
                                    ? 'bg-primary'
                                    : 'bg-warning'
                            "
                            :style="{
                                width: `${
                                    summary.newCustomerTargetProgress || 0
                                }%`,
                            }"
                        ></div>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">
                        月間目標の{{
                            summary.newCustomerTargetProgress || 0
                        }}%達成
                    </p>
                </div>
            </div>
        </div>

        <!-- 売上グラフ -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-medium">売上推移</h2>
                <el-select
                    v-model="chartType"
                    placeholder="表示単位"
                    size="small"
                >
                    <el-option label="日次" value="daily" />
                    <el-option label="週次" value="weekly" />
                    <el-option label="月次" value="monthly" />
                </el-select>
            </div>

            <div class="h-80">
                <div ref="chartRef" class="h-full w-full"></div>
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
                            <span
                                :class="
                                    scope.row.trend > 0
                                        ? 'text-success'
                                        : 'text-error'
                                "
                            >
                                {{ scope.row.trend > 0 ? "+" : ""
                                }}{{ scope.row.trend }}%
                                {{ scope.row.trend > 0 ? "↑" : "↓" }}
                            </span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 施術割合 -->
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-lg font-medium mb-4">施術割合</h2>
                <div class="h-64">
                    <div ref="pieChartRef" class="h-full w-full"></div>
                </div>
            </div>
        </div>

        <!-- 最近の売上 -->
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-medium">最近の売上</h2>
                <el-button type="primary" size="small" plain
                    >すべて表示</el-button
                >
            </div>

            <el-table :data="recentSales" style="width: 100%">
                <el-table-column prop="date" label="日時" width="180" />
                <el-table-column prop="customers.name" label="お客様名" />
                <el-table-column
                    prop="appointments.service_type"
                    label="施術内容"
                />
                <el-table-column prop="staff.name" label="担当スタッフ" />
                <el-table-column prop="amount" label="金額" />
                <el-table-column prop="paymentMethod" label="支払方法" />
                <el-table-column fixed="right" label="操作" width="120">
                    <template #default>
                        <el-button
                            link
                            type="primary"
                            size="small"
                            @click="viewSalesDetail"
                        >
                            詳細
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from "vue";
import { useSalesStore } from "~/stores/sales";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, PieChart } from "echarts/charts";
import {
    GridComponent,
    TooltipComponent,
    TitleComponent,
    LegendComponent,
} from "echarts/components";
import * as echarts from "echarts/core";

// EChartsコンポーネントの登録
use([
    CanvasRenderer,
    LineChart,
    PieChart,
    GridComponent,
    TooltipComponent,
    TitleComponent,
    LegendComponent,
]);

const salesStore = useSalesStore();
const dateRangeType = ref("month");
const customDateRange = ref(null);
const chartType = ref("daily");
const topServices = ref([]);
const chartRef = ref(null);
const pieChartRef = ref(null);
const pieChart = ref(null);
const chart = ref(null);

const loading = computed(() => salesStore.loading);
const error = computed(() => salesStore.error);
const summary = computed(() => salesStore.summary || {});
const recentSales = computed(() => salesStore.records || []);

// グラフの更新
const updateChart = (data) => {
    if (!chart.value) return;

    const dates = Object.keys(data).sort();
    const values = dates.map((date) => data[date]);

    const option = {
        grid: {
            top: 30,
            right: 20,
            bottom: 30,
            left: 60,
            containLabel: true,
        },
        tooltip: {
            trigger: "axis",
            formatter: (params) => {
                const value = params[0].value;
                return `${params[0].name}<br/>¥${value.toLocaleString()}`;
            },
        },
        xAxis: {
            type: "category",
            data: dates,
            axisLabel: {
                formatter: (value) => {
                    switch (chartType.value) {
                        case "daily":
                            return value.slice(5); // MM-DD
                        case "weekly":
                            return `Week ${value}`; // Week番号
                        case "monthly":
                            return value.slice(0, 7); // YYYY-MM
                        default:
                            return value;
                    }
                },
            },
        },
        yAxis: {
            type: "value",
            axisLabel: {
                formatter: (value) => `¥${value.toLocaleString()}`,
            },
        },
        series: [
            {
                data: values,
                type: "line",
                smooth: false,
                areaStyle: {
                    opacity: 0.1,
                },
                lineStyle: {
                    width: 2,
                    type: "solid",
                },
                itemStyle: {
                    color: "#409EFF",
                    borderWidth: 2,
                },
                symbol: "circle",
                symbolSize: 8,
            },
        ],
    };

    chart.value.setOption(option);
};

// データの取得とグラフの更新
const loadData = async () => {
    try {
        await Promise.all([
            salesStore.fetchSummary(dateRangeType.value),
            salesStore.fetchRecords(),
        ]);
        // 初期データの設定
        const mockData = {
            "2024-03-01": 150000,
            "2024-03-02": 180000,
            "2024-03-03": 120000,
            "2024-03-04": 200000,
            "2024-03-05": 160000,
            "2024-03-06": 190000,
            "2024-03-07": 210000,
        };
        updateChart(mockData);
    } catch (e) {
        ElMessage.error("データの取得に失敗しました");
    }
};

// 円グラフの初期化と更新
const initPieChart = () => {
    if (!pieChartRef.value) return;

    pieChart.value = echarts.init(pieChartRef.value);
    const option = {
        tooltip: {
            trigger: "item",
            formatter: "{b}: {c}件 ({d}%)",
        },
        legend: {
            orient: "vertical",
            right: 10,
            top: "center",
        },
        series: [
            {
                type: "pie",
                radius: ["40%", "70%"],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 4,
                    borderColor: "#fff",
                    borderWidth: 2,
                },
                label: {
                    show: false,
                    position: "center",
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 16,
                        fontWeight: "bold",
                    },
                },
                labelLine: {
                    show: false,
                },
                data: [
                    { value: 35, name: "ジェルネイル" },
                    { value: 25, name: "スカルプチュア" },
                    { value: 20, name: "ケア" },
                    { value: 15, name: "アート" },
                    { value: 5, name: "その他" },
                ],
            },
        ],
    };
    pieChart.value.setOption(option);
    window.addEventListener("resize", () => pieChart.value?.resize());
};

// 既存のonMountedを修正
onMounted(() => {
    nextTick(() => {
        // 既存の折れ線グラフの初期化
        if (chartRef.value) {
            chart.value = echarts.init(chartRef.value);
            loadData();
        }
        // 円グラフの初期化
        initPieChart();
        window.addEventListener("resize", handleResize);
    });
});

// 既存のonUnmountedを修正
onUnmounted(() => {
    if (chart.value) {
        chart.value.dispose();
    }
    if (pieChart.value) {
        pieChart.value.dispose();
    }
    window.removeEventListener("resize", handleResize);
});

const handleResize = () => {
    if (chart.value) {
        chart.value.resize();
    }
};

const updateDateRange = () => {
    loadData();
};

const loadSalesData = async () => {
    try {
        await salesStore.fetchSummary(dateRangeType.value);
        // ここでグラフデータを更新
        const mockData = {
            "2024-03-01": 150000,
            "2024-03-02": 180000,
            "2024-03-03": 120000,
            "2024-03-04": 200000,
            "2024-03-05": 160000,
            "2024-03-06": 190000,
            "2024-03-07": 210000,
        };
        updateChart(mockData);
    } catch (e) {
        ElMessage.error("データの取得に失敗しました");
    }
};

const exportReport = () => {
    // Implement report export
};

const generateCustomReport = () => {
    // Implement custom report generation
};

const viewSalesDetail = () => {
    // Implement sales detail view
};

// chartTypeの変更を監視
watch(chartType, () => {
    loadData();
});
</script>
