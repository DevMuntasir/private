<template>
  <div class="h-[400px] bg-[#d9c7aa] mt-5 overflow-hidden">
    <div class="relative h-full">
      <!-- Orange banner -->
      <div
        class="absolute left-0 top-0 bg-[#ff6a00] text-white w-48 h-24 flex flex-col p-3"
      >
        <span class="text-xs tracking-wide">Total Amount Due</span>
        <span class="text-4xl font-bold leading-none mt-1">{{
          currency(totalAmount)
        }}</span>
      </div>

      <div class="flex h-full items-center  justify-start pl-8 pr-8 gap-16">
        <!-- Pie Chart (Chart.js) -->
        <div class="mt-16">
          <canvas ref="chartEl" width="180" height="180"></canvas>
        </div>

        <!-- Legend / Table -->
        <div class="grid grid-cols-[200px_140px_130px] gap-x-8 text-sm">
          <div class="col-span-1 font-semibold mb-2 font-primary text-[16px]">Invoice Status</div>
          <div class="font-semibold mb-2 font-primary text-[16px]">Quantity</div>
          <div class="font-semibold mb-2 font-primary text-[16px]">Amount Due</div>

          <template v-for="row in rows" :key="row.key">
          
              <div class="flex items-center gap-3 my-2 font-secondary-Regular">
                <span
                  class="inline-block w-3 h-3 rounded-full"
                  :style="{ backgroundColor: row.color }"
                ></span>
                <span>{{ row.label }}</span>
              </div>
              <div class=" font-secondary-Regular">{{ row.qty }}</div>
              <div class=" font-secondary-Regular">{{ currency(row.amount) }}</div>
          
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import Chart from "chart.js/auto";

type Row = {
  key: string;
  label: string;
  qty: number;
  amount: number;
  color: string;
};

const rows = computed<Row[]>(() => [
  {
    key: "not_due",
    label: "Not due yet",
    qty: 8,
    amount: 254,
    color: "#4b4b4b",
  },
  { key: "due_soon", label: "Due soon", qty: 3, amount: 50, color: "#2ecc71" },
  { key: "overdue", label: "Overdue", qty: 1, amount: 25, color: "#f4b400" },
  { key: "at_risk", label: "At Risk", qty: 0, amount: 0, color: "#ff3b30" },
  { key: "suspended", label: "Suspended", qty: 0, amount: 0, color: "#e01e37" },
]);

const totalAmount = computed(() =>
  rows.value.reduce((s, r) => s + r.amount, 0)
);

function currency(v: number) {
  return `$${v}`;
}

// --- Chart.js setup ---
const chartEl = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

const chartData = computed(() => ({
  labels: rows.value.filter((r) => r.qty > 0).map((r) => r.label),
  datasets: [
    {
      data: rows.value.filter((r) => r.qty > 0).map((r) => r.qty),
      backgroundColor: rows.value.filter((r) => r.qty > 0).map((r) => r.color),
      borderWidth: 0,
    },
  ],
}));

onMounted(() => {
  if (!chartEl.value) return;
  chart = new Chart(chartEl.value, {
    type: "doughnut",
    data: chartData.value,
    options: {
      responsive: false, // fixed size to match screenshot
      maintainAspectRatio: false,
      cutout: "60%", // thick ring like the screenshot
      rotation: -90, // start at the top
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
    },
  });
});

watch(chartData, (val) => {
  if (chart) {
    chart.data = val;
    chart.update();
  }
});

onBeforeUnmount(() => {
  chart?.destroy();
});
</script>
