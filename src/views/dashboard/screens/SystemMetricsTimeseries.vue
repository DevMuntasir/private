<template>
  <div class="bg-white mt-6 p-4 w-full">
    <!-- Top controls -->
    <div class="flex flex-wrap items-center gap-3 mb-3">
      <!-- Series toggles -->
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">Series:</span>
        <label v-for="s in allSeries" :key="s.key" class="flex items-center gap-1 text-sm">
          <input type="checkbox" v-model="selectedSeries" :value="s.key" />
          <span :style="{ color: s.color }">{{ s.label }}</span>
        </label>
        <button class="px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300"
                @click="toggleAll">
          {{ selectedSeries.length === allSeries.length ? 'Clear' : 'Select all' }}
        </button>
      </div>

      <!-- Per view -->
      <label class="flex items-center gap-2 text-sm">
        <span>Per view:</span>
        <input type="number" min="5" max="500" step="1" v-model.number="pageSize"
               class="w-20 px-2 py-1 border rounded" />
      </label>

      <!-- Options -->
      <div class="flex items-center gap-3 text-sm">
        <label class="flex items-center gap-1">
          <input type="checkbox" v-model="time12h" />
          <span>12h time</span>
        </label>
        <label class="flex items-center gap-1">
          <input type="checkbox" v-model="showAvg" />
          <span>Show avg</span>
        </label>
        <label class="flex items-center gap-1">
          <input type="checkbox" v-model="fillArea" />
          <span>Fill</span>
        </label>
        <div class="flex items-center gap-1">
          <span>Group:</span>
          <button @click="granularity='day'"
                  :class="['px-2 py-1 text-xs rounded', granularity==='day' ? 'bg-[#4b4b4b] text-white' : 'bg-gray-200']">Day</button>
          <button @click="granularity='month'"
                  :class="['px-2 py-1 text-xs rounded', granularity==='month' ? 'bg-[#4b4b4b] text-white' : 'bg-gray-200']">Month</button>
          <button @click="granularity='year'"
                  :class="['px-2 py-1 text-xs rounded', granularity==='year' ? 'bg-[#4b4b4b] text-white' : 'bg-gray-200']">Year</button>
          <button @click="granularity='none'"
                  :class="['px-2 py-1 text-xs rounded', granularity==='none' ? 'bg-[#4b4b4b] text-white' : 'bg-gray-200']">None</button>
        </div>

        <div class="flex items-center gap-1">
          <span>Hours:</span>
          <input type="number" min="0" max="23" step="1" v-model.number="hourFrom" class="w-14 px-1 py-0.5 border rounded" />
          <span>to</span>
          <input type="number" min="0" max="23" step="1" v-model.number="hourTo" class="w-14 px-1 py-0.5 border rounded" />
        </div>
        <button class="px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300" @click="exportCSV">
          Export CSV
        </button>
      </div>
    </div>

    <!-- Time range controls -->
    <div class="flex flex-wrap items-center gap-3 mb-3">
      <label class="flex items-center gap-2 text-sm">
        <span>Quick range:</span>
        <select v-model="quickRange" class="px-2 py-1 border rounded">
          <option value="">Custom…</option>
          <option value="5m">Last 5 min</option>
          <option value="15m">Last 15 min</option>
          <option value="1h">Last 1 hour</option>
          <option value="3h">Last 3 hours</option>
          <option value="all">All</option>
        </select>
      </label>

      <label class="flex items-center gap-2 text-sm">
        <span>Start:</span>
        <input type="datetime-local" v-model="timeStartInput" class="px-2 py-1 border rounded" />
      </label>
      <label class="flex items-center gap-2 text-sm">
        <span>End:</span>
        <input type="datetime-local" v-model="timeEndInput" class="px-2 py-1 border rounded" />
      </label>

      <div class="text-xs text-gray-500">
        (Inputs use your local time; ticks & tooltip respect <b>useUTC={{ useUTC }}</b>)
      </div>
    </div>

    <!-- Line Chart -->
    <div style="height:520px">
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <!-- Pagination footer -->
    <div class="mt-3 flex items-center gap-3 text-sm">
      <button @click="prevPage" :disabled="page <= 1"
              class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">
        Prev
      </button>
      <button @click="nextPage" :disabled="page >= totalPages"
              class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">
        Next
      </button>
      <span>Page {{ page }} / {{ totalPages }}</span>
      <span class="text-gray-500">
        Showing {{ pageFrom }}–{{ pageTo }} of {{ totalFiltered }} (from {{ rowsAll.length }} total)
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
  Decimation,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(TimeScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Title, Decimation);

// ===== props =====
const props = defineProps({
  metrics: { type: Array, required: true }, // [{ reported_at, cpu_percent, ram_percent, disk_percent }]
  useUTC: { type: Boolean, default: false },
});

// ===== helpers =====
const num = (v) => (typeof v === "string" ? parseFloat(v) : Number(v));
const toDate = (s) => new Date(s);

// theme colors (Tailwind): primary.500, secondary.500, accent.500
const themeColors = {
  primary: "#6366f1",
  secondary: "#14b8a6",
  accent: "#f97316",
};

// datetime-local utils
const pad2 = (n) => String(n).padStart(2, "0");
const toLocalInput = (ts) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
const parseLocalInput = (s) => {
  if (!s) return null;
  const t = new Date(s).getTime();
  return isNaN(t) ? null : t;
};

// ===== normalize rows =====
const rowsAll = computed(() =>
  (props.metrics ?? [])
    .map((m) => ({
      t: toDate(m.reported_at),
      cpu: num(m.cpu_percent),
      ram: num(m.ram_percent),
      disk: num(m.disk_percent),
    }))
    .filter((r) => Number.isFinite(r.t?.getTime()))
    .sort((a, b) => a.t - b.t)
);

// ===== series config & toggles =====
const allSeries = [
  { key: "cpu",  label: "CPU %",  color: themeColors.primary },
  { key: "ram",  label: "RAM %",  color: themeColors.secondary },
  { key: "disk", label: "Disk %", color: themeColors.accent },
];
const selectedSeries = ref(allSeries.map((s) => s.key));
const toggleAll = () => {
  selectedSeries.value =
    selectedSeries.value.length === allSeries.length ? [] : allSeries.map((s) => s.key);
};

// ===== time range (defaults to full) =====
const fullMinTs = computed(() =>
  rowsAll.value.length ? rowsAll.value[0].t.getTime() : Date.now()
);
const fullMaxTs = computed(() =>
  rowsAll.value.length ? rowsAll.value[rowsAll.value.length - 1].t.getTime() : Date.now()
);

const quickRange = ref("");
const timeStartInput = ref(toLocalInput(fullMinTs.value));
const timeEndInput = ref(toLocalInput(fullMaxTs.value));

watch([fullMinTs, fullMaxTs], ([a, b]) => {
  if (!timeStartInput.value) timeStartInput.value = toLocalInput(a);
  if (!timeEndInput.value) timeEndInput.value = toLocalInput(b);
}, { immediate: true });

watch(quickRange, (qr) => {
  if (qr === "all") {
    timeStartInput.value = toLocalInput(fullMinTs.value);
    timeEndInput.value = toLocalInput(fullMaxTs.value);
  } else if (qr) {
    const end = fullMaxTs.value;
    let delta = 0;
    if (qr === "5m")  delta = 5  * 60 * 1000;
    if (qr === "15m") delta = 15 * 60 * 1000;
    if (qr === "1h")  delta = 60 * 60 * 1000;
    if (qr === "3h")  delta = 3  * 60 * 1000 * 60;
    timeStartInput.value = toLocalInput(end - delta);
    timeEndInput.value = toLocalInput(end);
  }
  page.value = 1;
});

const timeStartMs = computed(() => parseLocalInput(timeStartInput.value) ?? fullMinTs.value);
const timeEndMs   = computed(() => parseLocalInput(timeEndInput.value)   ?? fullMaxTs.value);

// ===== filter by time =====
const rowsFiltered = computed(() =>
  rowsAll.value.filter((r) => {
    const t = r.t.getTime();
    return t >= timeStartMs.value && t <= timeEndMs.value;
  })
);

// ===== pagination =====
const pageSize = ref(30);
const page = ref(1);
const totalFiltered = computed(() => rowsFiltered.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalFiltered.value / pageSize.value)));
watch([rowsFiltered, pageSize], () => { page.value = 1; });
watch(page, (p) => { if (p > totalPages.value) page.value = totalPages.value; });

const pageFrom = computed(() =>
  Math.min(totalFiltered.value, (page.value - 1) * pageSize.value + 1)
);
const pageTo = computed(() =>
  Math.min(totalFiltered.value, page.value * pageSize.value)
);
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return rowsFiltered.value.slice(start, end);
});
const prevPage = () => { if (page.value > 1) page.value--; };
const nextPage = () => { if (page.value < totalPages.value) page.value++; };

// ===== x-axis domain for current view (with 60s padding) =====
const minXView = computed(() => {
  const rows = effectiveRows.value;
  if (!rows.length) return new Date(fullMinTs.value);
  const min = rows[0].t.getTime();
  return new Date(min - 60 * 1000);
});
const maxXView = computed(() => {
  const rows = effectiveRows.value;
  if (!rows.length) return new Date(fullMaxTs.value);
  const max = rows[rows.length - 1].t.getTime();
  return new Date(max + 60 * 1000);
});

// ===== tick positions (per-point; sampled) =====
function sampleTicks(values, maxTicks) {
  if (!values?.length) return [];
  if (values.length <= maxTicks) return values;
  const step = Math.ceil(values.length / maxTicks);
  const out = [];
  for (let i = 0; i < values.length; i += step) out.push(values[i]);
  if (out[out.length - 1] !== values[values.length - 1]) out.push(values[values.length - 1]);
  return out;
}
const tickPositions = computed(() => {
  const xs = effectiveRows.value.map((r) => r.t.getTime());
  return Array.from(new Set(xs)).sort((a, b) => a - b);
});

// ===== datasets (only selected series) =====
const seriesMap = {
  cpu:  { label: "CPU %",  color: themeColors.primary },
  ram:  { label: "RAM %",  color: themeColors.secondary },
  disk: { label: "Disk %", color: themeColors.accent },
};

// Additional options
const time12h = ref(false);
const showAvg = ref(false);
const fillArea = ref(false);
const granularity = ref('none'); // none | day | month | year
const hourFrom = ref(0);
const hourTo = ref(23);

function movingAverage(arr, windowSize = 5) {
  const out = [];
  let sum = 0;
  const q = [];
  for (let i = 0; i < arr.length; i++) {
    const v = Number(arr[i]) || 0;
    q.push(v);
    sum += v;
    if (q.length > windowSize) sum -= q.shift();
    out.push(sum / q.length);
  }
  return out;
}

// Aggregation helpers
function keyFor(date, mode) {
  const d = new Date(date);
  if (mode === 'day') {
    const y = props.useUTC ? d.getUTCFullYear() : d.getFullYear();
    const m = (props.useUTC ? d.getUTCMonth() : d.getMonth()) + 1;
    const day = props.useUTC ? d.getUTCDate() : d.getDate();
    return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  if (mode === 'month') {
    const y = props.useUTC ? d.getUTCFullYear() : d.getFullYear();
    const m = (props.useUTC ? d.getUTCMonth() : d.getMonth()) + 1;
    return `${y}-${String(m).padStart(2, '0')}`;
  }
  if (mode === 'year') {
    return String(props.useUTC ? d.getUTCFullYear() : d.getFullYear());
  }
  return d.getTime();
}
function dateForKey(key, mode) {
  if (mode === 'day') {
    const [y, m, d] = key.split('-').map((x) => parseInt(x, 10));
    return props.useUTC ? new Date(Date.UTC(y, m - 1, d, 0, 0, 0)) : new Date(y, m - 1, d, 0, 0, 0);
  }
  if (mode === 'month') {
    const [y, m] = key.split('-').map((x) => parseInt(x, 10));
    return props.useUTC ? new Date(Date.UTC(y, m - 1, 1, 0, 0, 0)) : new Date(y, m - 1, 1, 0, 0, 0);
  }
  if (mode === 'year') {
    const y = parseInt(key, 10);
    return props.useUTC ? new Date(Date.UTC(y, 0, 1, 0, 0, 0)) : new Date(y, 0, 1, 0, 0, 0);
  }
  return new Date(Number(key));
}

// baseRows: apply hour-of-day filter first (uses UTC if useUTC)
const baseRows = computed(() => {
  const from = Math.max(0, Math.min(23, Number(hourFrom.value) || 0));
  const to = Math.max(0, Math.min(23, Number(hourTo.value) || 23));
  const wrap = from > to;
  return pagedRows.value.filter((r) => {
    const h = props.useUTC ? r.t.getUTCHours() : r.t.getHours();
    return wrap ? (h >= from || h <= to) : (h >= from && h <= to);
  });
});

const effectiveRows = computed(() => {
  const mode = granularity.value;
  if (mode === 'none') return baseRows.value;
  const map = new Map();
  for (const r of baseRows.value) {
    const k = keyFor(r.t, mode);
    let acc = map.get(k);
    if (!acc) acc = { t: r.t, cpu: 0, ram: 0, disk: 0, n: 0 };
    acc.cpu += r.cpu;
    acc.ram += r.ram;
    acc.disk += r.disk;
    acc.n += 1;
    map.set(k, acc);
  }
  const rows = [];
  for (const [k, v] of map.entries()) {
    rows.push({
      t: dateForKey(k, mode),
      cpu: v.cpu / v.n,
      ram: v.ram / v.n,
      disk: v.disk / v.n,
    });
  }
  rows.sort((a, b) => a.t - b.t);
  return rows;
});

const chartData = computed(() => {
  const datasets = [];
  for (const key of selectedSeries.value) {
    const cfg = seriesMap[key];
    if (!cfg) continue;
    const values = effectiveRows.value.map((r) => r[key]);
    const points = effectiveRows.value.map((r) => ({ x: r.t, y: r[key] }));

    datasets.push({
      label: cfg.label,
      data: points,
      parsing: { xAxisKey: "x", yAxisKey: "y" },
      type: "line",
      borderColor: cfg.color,
      backgroundColor: cfg.color,
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 3,
      pointHitRadius: 6,
      fill: fillArea.value ? "origin" : false,
    });

    if (showAvg.value) {
      const avg = movingAverage(values, 5);
      const avgPoints = effectiveRows.value.map((r, i) => ({ x: r.t, y: avg[i] }));
      datasets.push({
        label: `${cfg.label} (avg)`,
        data: avgPoints,
        parsing: { xAxisKey: "x", yAxisKey: "y" },
        type: "line",
        borderColor: cfg.color,
        backgroundColor: cfg.color,
        borderWidth: 1.5,
        tension: 0.25,
        pointRadius: 0,
        borderDash: [6, 4],
        fill: false,
      });
    }
  }
  return { datasets };
});

// ===== options with vertical tooltip + smart ticks =====
const toTitleString = (date) => {
  if (!date) return "";
  if (props.useUTC) {
    return new Date(date).toISOString().substring(0, 19).replace("T", " ") + " UTC";
  }
  return new Date(date).toLocaleString();
};

function formatTimeTick(v) {
  const d = new Date(v);
  if (props.useUTC) {
    const hh = d.getUTCHours();
    const mm = d.getUTCMinutes();
    const ss = d.getUTCSeconds();
    if (time12h.value) {
      const period = hh < 12 ? "AM" : "PM";
      const h12 = hh % 12 || 12;
      const pad2 = (n) => String(n).padStart(2, "0");
      return `${h12}:${pad2(mm)}:${pad2(ss)} ${period}`;
    }
    return d.toISOString().substring(11, 19); // HH:mm:ss
  }
  // Local time
  return d.toLocaleTimeString([], { hour12: time12h.value });
}

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: { display: true, position: "top" },
    tooltip: {
      displayColors: false,
      backgroundColor: "rgba(17,24,39,0.9)",
      padding: 10,
      cornerRadius: 8,
      titleColor: "#fff",
      bodyColor: "#fff",
      titleFont: { weight: "bold", size: 12 },
      bodyFont: { size: 12 },
      title: (items) => (items?.length ? toTitleString(items[0].parsed.x) : ""),
      // multiple datasets => Chart.js stacks labels vertically
      label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%`,
    },
    title: { display: false },
    decimation: { enabled: true, algorithm: "min-max" },
  },
  scales: {
    x: {
      type: "time",
      min: minXView.value,
      max: maxXView.value,
      bounds: "ticks",
      time: {
        unit: "second",
        displayFormats: { second: "HH:mm:ss", minute: "HH:mm" },
        tooltipFormat: "HH:mm:ss",
      },
      adapters: { date: { zone: props.useUTC ? "utc" : "default" } },
      title: { display: true, text: "Time" },
      grid: { display: true },
      afterBuildTicks: (scale) => {
        const xs = tickPositions.value;
        const approxLabelPx = 80;
        const maxTicks = Math.max(3, Math.floor(scale.width / approxLabelPx));
        const sampled = sampleTicks(xs, maxTicks);
        scale.ticks = sampled.map((v) => ({ value: v }));
      },
      ticks: {
        autoSkip: false,
        callback: (v) => formatTimeTick(v),
      },
    },
    y: {
      type: "linear",
      position: "left",
      min: 0,
      max: 100,
      ticks: { callback: (v) => v + "%" },
      title: { display: true, text: "Percent (%)" },
      grid: { display: true },
    },
  },
}));

// Export currently visible rows as CSV (time,cpu,ram,disk)
function exportCSV() {
  const rows = effectiveRows.value;
  const header = ["time","cpu","ram","disk"];
  const lines = [header.join(",")];
  for (const r of rows) {
    const t = r.t.toISOString();
    lines.push([t, r.cpu, r.ram, r.disk].join(","));
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "system-metrics.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
/* keep chart text crisp */
</style>
 

