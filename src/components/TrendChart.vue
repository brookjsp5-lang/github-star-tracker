<template>
  <div class="chart-container">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  repos: {
    type: Array,
    required: true
  }
})

const chartData = computed(() => {
  const labels = props.repos.map(repo => repo.name.split('/')[1] || repo.name)
  
  const datasets = [
    {
      label: 'Star 总数',
      data: props.repos.map(repo => repo.stars),
      borderColor: '#00ffff',
      backgroundColor: 'rgba(0, 255, 255, 0.1)',
      borderWidth: 3,
      pointBackgroundColor: '#00ffff',
      pointBorderColor: '#0a0e17',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 8,
      tension: 0.4,
      fill: true
    },
    {
      label: '本周增长',
      data: props.repos.map(repo => repo.starGrowth),
      borderColor: '#00ff88',
      backgroundColor: 'rgba(0, 255, 136, 0.05)',
      borderWidth: 2,
      pointBackgroundColor: '#00ff88',
      pointBorderColor: '#0a0e17',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 7,
      tension: 0.4,
      fill: true
    }
  ]

  return { labels, datasets }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2.5,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#94a3b8',
        font: {
          family: "'JetBrains Mono', monospace",
          size: 12
        },
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      titleColor: '#e2e8f0',
      bodyColor: '#94a3b8',
      borderColor: '#2d3748',
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      callbacks: {
        label: function(context) {
          return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} ⭐`
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(45, 55, 72, 0.3)',
        drawBorder: false
      },
      ticks: {
        color: '#94a3b8',
        font: {
          family: "'JetBrains Mono', monospace",
          size: 10
        },
        maxRotation: 45,
        minRotation: 45
      }
    },
    y: {
      grid: {
        color: 'rgba(45, 55, 72, 0.3)',
        drawBorder: false
      },
      ticks: {
        color: '#94a3b8',
        font: {
          family: "'JetBrains Mono', monospace",
          size: 11
        },
        callback: function(value) {
          if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
          if (value >= 1000) return (value / 1000).toFixed(0) + 'K'
          return value
        }
      }
    }
  },
  animation: {
    duration: 1500,
    easing: 'easeOutQuart'
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: auto;
}

@media (max-width: 768px) {
  .chart-container :deep(canvas) {
    max-height: 300px !important;
  }
}
</style>