<!-- src/components/ScreenStatusSynchronizedCharts.vue -->
<script setup lang="ts">
import { useScreenStatusStore } from '@/store/use-screen-status-store';
import { onMounted, onBeforeUnmount, reactive, watch } from 'vue'

// CanvasJS Vue কম্পোনেন্টটা গ্লোবালি রেজিস্টার্ড (main.ts) — <CanvasJSChart /> ব্যবহার করলেই হবে
// রেফারেন্স: Vue wrapper setup & chart-ref event :contentReference[oaicite:2]{index=2}

const store = useScreenStatusStore()

// লোকাল dataPoints অ্যারে (CanvasJS options এগুলোর রেফারেন্স ধরে)
const dps = reactive({
  cpu: [] as { x: Date; y: number }[],
  ram: [] as { x: Date; y: number }[],
  disk: [] as { x: Date; y: number }[]
})

// চার্ট ইনস্ট্যান্সের লিস্ট (সিঙ্ক করার জন্য দরকার)
const charts: any[] = []

function chartRef(instance: any) {
  if (instance && !charts.includes(instance)) charts.push(instance)
}

function syncCharts(
  chartsList: any[], syncToolTip = true, syncCrosshair = true, syncAxisXRange = true
) {
  // CanvasJS অফিসিয়াল সিঙ্ক প্যাটার্ন (tooltip updated/hidden, crosshair, rangeChanged)
  // রেফারেন্স কোড লজিক: Vue Synchronized Charts example :contentReference[oaicite:3]{index=3}
  // নিচে হ্যান্ডলারগুলো সেট করা হলো:
  const onToolTipUpdated = function (e: any) {
    for (const c of chartsList) if (c !== e.chart) c.toolTip.showAtX(e.entries[0].xValue)
  }
  const onToolTipHidden = function (e: any) {
    for (const c of chartsList) if (c !== e.chart) c.toolTip.hide()
  }
  const onCrosshairUpdated = function (e: any) {
    for (const c of chartsList) if (c !== e.chart) c.axisX[0].crosshair.showAt(e.value)
  }
  const onCrosshairHidden = function (e: any) {
    for (const c of chartsList) if (c !== e.chart) c.axisX[0].crosshair.hide()
  }
  const onRangeChanged = function (e: any) {
    for (const c of chartsList) {
      if (e.trigger === 'reset') {
        c.options.axisX.viewportMinimum = c.options.axisX.viewportMaximum = null
        c.options.axisY.viewportMinimum = c.options.axisY.viewportMaximum = null
        c.render()
      } else if (c !== e.chart) {
        c.options.axisX.viewportMinimum = e.axisX[0].viewportMinimum
        c.options.axisX.viewportMaximum = e.axisX[0].viewportMaximum
        c.render()
      }
    }
  }

  for (const c of chartsList) {
    if (syncToolTip) {
      c.options.toolTip = c.options.toolTip || {}
      c.options.toolTip.shared = true // shared tooltip
      c.options.toolTip.updated = onToolTipUpdated
      c.options.toolTip.hidden = onToolTipHidden
    }
    if (syncCrosshair) {
      c.options.axisX = c.options.axisX || {}
      c.options.axisX.valueFormatString = c.options.axisX.valueFormatString ?? 'HH:mm:ss'
      c.options.axisX.crosshair = {
        ...(c.options.axisX.crosshair || {}),
        enabled: true,
        snapToDataPoint: true,
        valueFormatString: 'HH:mm:ss',
        updated: onCrosshairUpdated,
        hidden: onCrosshairHidden
      }
    }
    if (syncAxisXRange) {
      c.options.zoomEnabled = true
      c.options.rangeChanged = onRangeChanged
    }
    c.render()
  }
}

// CanvasJS options
const commonStyle = { width: '100%', height: '320px' }

const cpuOptions = reactive({
  animationEnabled: true,
  backgroundColor: "white",
  title: { text: "CPU Usage (%)", fontColor: "#414141"},
  axisX: { labelFontColor: "#6B7280", gridColor: "#E5E7EB",
    crosshair: { enabled: true, color: "#9CA3AF", opacity: 0.8 } },
  axisY: { suffix: "%", includeZero: true, maximum: 100, labelFontColor: "#6B7280", gridColor: "#F3F4F6" },
  toolTip: { backgroundColor: "#111827", fontColor: "#F9FAFB", borderColor: "#1F2937" },
  data: [{
    type: "splineArea",
    xValueType: "dateTime",
    dataPoints: dps.cpu,
    color: "#F97316",        // <-- CPU সিরিজের কাস্টম রং
    fillOpacity: 0.25,
    markerColor: "#F97316",
    lineThickness: 2
  }]
})

const ramOptions = reactive({
  title: { text: "RAM Usage (%)", fontColor: "#414141" },
  axisX: { labelFontColor: "#6B7280", gridColor: "#E5E7EB",
    crosshair: { enabled: true, color: "#9CA3AF", opacity: 0.8 } },
  axisY: { suffix: "%", includeZero: true, maximum: 100, labelFontColor: "#6B7280", gridColor: "#F3F4F6" },
  toolTip: { backgroundColor: "#111827", fontColor: "#F9FAFB", borderColor: "#1F2937" },
  data: [{
    type: "splineArea",
    xValueType: "dateTime",
    dataPoints: dps.ram,
    color: "#22C55E",        // <-- RAM সিরিজ
    fillOpacity: 0.25,
    markerColor: "#22C55E",
    lineThickness: 2
  }]
})

const diskOptions = reactive({
  title: { text: "Disk Usage (%)", fontColor: "#414141" },
  axisX: { labelFontColor: "#6B7280", gridColor: "#E5E7EB",
    crosshair: { enabled: true, color: "#9CA3AF", opacity: 0.8 } },
  axisY: { suffix: "%", includeZero: true, maximum: 100, labelFontColor: "#6B7280", gridColor: "#F3F4F6" },
  toolTip: { backgroundColor: "#111827", fontColor: "#F9FAFB", borderColor: "#1F2937" },
  data: [{
    type: "splineArea",
    xValueType: "dateTime",
    dataPoints: dps.disk,
    color: "#D81F26",        // <-- Disk সিরিজ
    fillOpacity: 0.25,
    markerColor: "#D81F26",
    lineThickness: 2
  }]
})


// store data -> local dps copy -> charts render
function refreshDataPoints() {
  dps.cpu.splice(0, dps.cpu.length, ...store.cpuDps)
  dps.ram.splice(0, dps.ram.length, ...store.ramDps)
  dps.disk.splice(0, dps.disk.length, ...store.diskDps)
  // CanvasJS Vue wrapper: ডেটা বদলালে render() কল করা উচিত
  // (Getting Started গাইডে বলা আছে) :contentReference[oaicite:4]{index=4}
  for (const c of charts) c.render()
}

watch(
  () => [store.items.length, store.loading, store.error],
  () => refreshDataPoints()
)

onMounted(() => {
  store.startPolling(15000) // 15s polling
  // সামান্য ডিলে দিয়ে চার্ট ইনস্ট্যান্স রেডি হলে সিঙ্ক সেট করি
  setTimeout(() => syncCharts(charts, true, true, true), 0)
})

onBeforeUnmount(() => {
  store.stopPolling()
})
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
    <CanvasJSChart :options="cpuOptions" :styles="commonStyle" @chart-ref="chartRef" />
    <CanvasJSChart :options="ramOptions" :styles="commonStyle" @chart-ref="chartRef" />
    <CanvasJSChart :options="diskOptions" :styles="commonStyle" @chart-ref="chartRef" />
  </div>
</template>

<style scoped>
.grid { margin-top: 8px; }
.canvasjs-chart-credit { display: none !important; }
</style>
