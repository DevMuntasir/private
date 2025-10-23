<template>
    <div class="chart-container">
      <Line :data="chartData" :options="chartOptions" />
    </div>
</template>

<script>
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default {
  name: "StatsChart",
  components: {
    Line,
  },
  data() {
    return {
      chartData: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        datasets: [
          {
            label: "Dataset 1",
            data: [65, 59, 80, 81, 56, 55, 40],
            borderColor: "#FF0000", // Red line
            backgroundColor: "rgba(255, 0, 0, 0.1)",
            tension: 0.3,
          },
          {
            label: "Dataset 2",
            data: [28, 48, 40, 19, 86, 27, 90],
            borderColor: "#000000", // Black line
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            tension: 0.3,
          },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(200, 200, 200, 0.1)",
            },
          },
          x: {
            grid: {
              color: "rgba(200, 200, 200, 0.1)",
            },
          },
        },
      },
    };
  },
};
</script>

<style scoped>


.orange {
  background-color: #ff501f;
  color: white;
}

.dark-gray {
  background-color: #4c4c4d;
  color: white;
}

.dark-yellow {
  background-color: #e08c23;
  color: white;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}



.chart-container {
    background: #E1D1B7;
  height: 400px;

 width: 100%;

  padding: 15px;
}
</style>
