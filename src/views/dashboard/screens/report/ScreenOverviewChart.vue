<template>
  <div class="chart-container">
    <Bar :data="barData" :options="chartOptions" />
  </div>
</template>

<script>
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

export default {
  name: "ScreenOverviewTimeline",
  components: { Bar },
  props: {
    // Array of { played_at_bd, ad_id, video, screen_id }
    logs: {
      type: Array,
      default: () => [],
    },
    // ms height for each play span
    barDurationMs: {
      type: Number,
      default: 30000, // 30s vertical bar
    },
  },
  computed: {
    barData() {
      const toMs = (s) => new Date(String(s).replace(" ", "T")).getTime();
      const items = Array.isArray(this.logs) ? [...this.logs] : [];
      items.sort((a, b) => toMs(a?.played_at_bd) - toMs(b?.played_at_bd));

      const cats = Array.from(new Set(items.map((it) => String(it?.ad_id ?? ""))));

      const points = items.map((it) => {
        const start = toMs(it?.played_at_bd);
        const end = start + this.barDurationMs;
        return {
          x: String(it?.ad_id),  // category along X
          y: [start, end],       // time range along Y (vertical bar)
          video: it?.video,
          screen_id: it?.screen_id,
        };
      });

      return {
        labels: cats,
        datasets: [
          {
            label: "Ad Plays",
            data: points,
            backgroundColor: (ctx) => {
              const raw = ctx.raw || {};
              const id = Number(raw?.x ?? 0);
              const colors = ["#e53935", "#fb8c00", "#43a047", "#1e88e5", "#8e24aa", "#6d4c41", "#00897b", "#3949ab"]; 
              return colors[id % colors.length];
            },
            borderWidth: 0,
            borderRadius: 3,
            barThickness: 18,
          },
        ],
      };
    },

    chartOptions() {
      const toMs = (s) => new Date(String(s).replace(" ", "T")).getTime();
      const times = (Array.isArray(this.logs) ? this.logs : [])
        .map((l) => toMs(l?.played_at_bd))
        .filter((t) => Number.isFinite(t))
        .sort((a, b) => a - b);

      const pad = 60_000; // 1 minute padding top/bottom
      const min = times.length ? times[0] - pad : undefined;
      const max = times.length ? times[times.length - 1] + pad : undefined;
      const range = max && min ? (max - min) : 0;
      const unit = range <= 5 * 60_000 ? "second" : "minute";

      return {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "x", // vertical bars
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            callbacks: {
              title(items) {
                if (!items?.length) return "";
                const raw = items[0].raw || {};
                const fmt = (d) => new Date(d).toLocaleTimeString([], { hour12: false });
                const [s, e] = raw.y || [];
                return `${fmt(s)} - ${fmt(e)}`;
              },
              label(ctx) {
                const raw = ctx.raw || {};
                const ad = raw?.x;
                const video = raw?.video || "";
                const screen = raw?.screen_id != null ? ` | screen: ${raw.screen_id}` : "";
                return `ad_id: ${ad} | video: ${video}${screen}`;
              },
            },
          },
        },
        scales: {
          x: {
            type: "category",
            title: { display: true, text: "ad_id" },
            grid: { display: false },
            ticks: { color: "#6b6b6b" },
            offset: true,
          },
          y: {
            type: "time",
            min,
            max,
            time: {
              unit,
              tooltipFormat: "HH:mm:ss",
              displayFormats: { second: "HH:mm:ss", minute: "HH:mm", hour: "HH:mm" },
            },
            title: { display: true, text: "played_at_bd (time)" },
            ticks: { color: "#6b6b6b" },
            grid: { color: "rgba(200,200,200,0.15)" },
          },
        },
      };
    },
  },
};
</script>

<style scoped>
.chart-container {
  background: #E1D1B7;
  height: 400px;
  width: 100%;
  padding: 15px;
}
</style>
