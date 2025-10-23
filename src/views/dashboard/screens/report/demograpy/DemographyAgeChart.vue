<template>
  <div class="w-1/2 bg-[#e6d3b4] border border-[#e6d3b4] rounded-md p-6">
    <h3 class="text-[#c17b1e] font-semibold mb-6 font-primary">Age</h3>

    <div class="relative h-[320px]">
      <!-- dotted horizontal guides -->
      <div class="absolute inset-0 pointer-events-none px-8">
        <div class="h-full flex flex-col justify-between opacity-70">
          <div v-for="n in 8" :key="n" class="border-t border-dotted border-[#cbb896]"></div>
        </div>
      </div>

      <canvas ref="chartEl"></canvas>
    </div>

    <!-- Legend -->
    <div class="mt-8 flex items-center gap-10 text-[16px]">
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 rounded-full inline-block" :style="{ backgroundColor: colors.male }"></span>
        <span class="text-[#6b6b6b]">Male</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-4 h-4 rounded-full inline-block" :style="{ backgroundColor: colors.female }"></span>
        <span class="text-[#6b6b6b]">Female</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, computed } from "vue";
import Chart, { ChartItem } from "chart.js/auto";

type Row = { group: string; male: number; female: number };

// স্ক্রিনশট-মতো ডাটা
const rows = ref<Row[]>([
  { group: "18-24", male: 10, female: 15 },
  { group: "24-50", male: 45, female: 55 },
  { group: "51-65", male: 45, female: 30 },
]);

const colors = {
  male: "#ff5a1f",   // উজ্জ্বল কমলা
  female: "#4b4b4b", // চারকোল
};

const labels = computed(() => rows.value.map(r => r.group));
const maleData = computed(() => rows.value.map(r => r.male));
const femaleData = computed(() => rows.value.map(r => r.female));

const chartEl = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

// কাস্টম লেবেল প্লাগইন (বারের উপর % দেখাতে)
const valueLabelPlugin = {
  id: "valueLabel",
  afterDatasetsDraw(c: Chart) {
    const { ctx } = c;
    ctx.save();
    ctx.font = "bold 12px system-ui";
    ctx.fillStyle = "#ffffff";

    c.getDatasetMeta(0).data.forEach((bar: any, i: number) => {
      const val = maleData.value[i];
      if (val > 0) {
        ctx.fillText(`${val}%`, bar.x + 8, bar.y + 4);
      }
    });

    c.getDatasetMeta(1).data.forEach((bar: any, i: number) => {
      const val = femaleData.value[i];
      if (val > 0) {
        const textWidth = ctx.measureText(`${val}%`).width;
        ctx.fillText(`${val}%`, bar.x + bar.width - textWidth - 8, bar.y + 4);
      }
    });

    ctx.restore();
  },
};

function makeConfig() {
  return {
    type: "bar" as const,
    data: {
      labels: labels.value,
      datasets: [
        {
          label: "Male",
          data: maleData.value,
          backgroundColor: colors.male,
          borderWidth: 0,
          borderRadius: 4,
          stack: "sex",
          barThickness: 34,
        },
        {
          label: "Female",
          data: femaleData.value,
          backgroundColor: colors.female,
          borderWidth: 0,
          borderRadius: 4,
          stack: "sex",
          barThickness: 34,
        },
      ],
    },
    options: {
      indexAxis: "y" as const, // horizontal
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
      scales: {
        x: {
          beginAtZero: true,
          suggestedMax: 60, // শতাংশ রেঞ্জ (স্ক্রিনশট-অনুপাত)
          grid: {
            color: "#cbb896",
            borderDash: [2, 4],
            drawTicks: false,
          },
          ticks: { display: false },
          border: { display: false },
        },
        y: {
          stacked: true,
          grid: { display: false },
          ticks: {
            color: "#6b6b6b",
            font: { size: 14, weight: "500" },
          },
          border: { display: false },
        },
      },
    },
    plugins: [valueLabelPlugin],
  };
}

onMounted(() => {
  if (!chartEl.value) return;
  chart = new Chart(chartEl.value as ChartItem, makeConfig());
});

watch([labels, maleData, femaleData], () => {
  if (!chart) return;
  chart.data.labels = labels.value as any;
  chart.data.datasets[0].data = maleData.value as any;
  chart.data.datasets[1].data = femaleData.value as any;
  chart.update();
});

onBeforeUnmount(() => chart?.destroy());
</script>
