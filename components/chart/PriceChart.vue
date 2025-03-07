<template>
  <div class="common-price-chart">
    <span class="chart-y-description is-size-7">
      Price ({{ chainSymbol }})
    </span>
    <NeoDropdown class="py-0" :mobile-modal="false">
      <template #trigger="{ active }">
        <NeoButton
          :label="selectedTimeRange.label"
          class="time-range-button"
          no-shadow
          :active="active" />
      </template>

      <NeoDropdownItem
        v-for="range in timeRangeList"
        :key="range.value"
        class="is-flex is-justify-content-center px-0 is-align-items-center"
        :active="selectedTimeRange.value === range.value"
        :value="selectedTimeRange"
        @click="setTimeRange({ value: range.value, label: range.label })">
        {{ range.label }}
      </NeoDropdownItem>
    </NeoDropdown>

    <div :class="{ content: !chartHeight }" :style="heightStyle">
      <canvas id="priceChart" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import ChartJS from 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import zoomPlugin from 'chartjs-plugin-zoom'
import { getChartData } from '@/utils/chart'
import { format } from 'date-fns'
import { NeoButton, NeoDropdown, NeoDropdownItem } from '@kodadot1/brick'
import { useEventListener } from '@vueuse/core'
ChartJS.register(zoomPlugin)
const { $i18n } = useNuxtApp()
const { chainSymbol } = useChain()
const { isDarkMode } = useTheme()
const daysTranslation = (day: number) => $i18n.t('priceChart.days', [day])

const timeRangeList = [
  {
    value: 0,
    label: $i18n.t('priceChart.all'),
  },
  {
    value: 14,
    label: daysTranslation(14),
  },
  {
    value: 30,
    label: daysTranslation(30),
  },
  {
    value: 90,
    label: daysTranslation(90),
  },
]

const selectedTimeRange = ref(timeRangeList[0])

const setTimeRange = (value: { value: number; label: string }) => {
  selectedTimeRange.value = value
}

const props = defineProps<{
  priceChartData?: [Date, number][][]
  chartHeight?: string
}>()

const heightStyle = computed(() =>
  props.chartHeight ? `height: ${props.chartHeight}` : ''
)
let Chart: ChartJS<'line', any, unknown>

const onWindowResize = () => {
  Chart?.resize()
}
useEventListener(window, 'resize', onWindowResize)

onMounted(() => {
  getPriceChartData()
})

const lineColor = computed(() => {
  if (isDarkMode.value) {
    return 'white'
  } else {
    return '#181717'
  }
})

const gridColor = computed(() => (isDarkMode.value ? '#6b6b6b' : '#cccccc'))

const displayChartData = computed(() => {
  if (props.priceChartData) {
    const timeRangeValue = selectedTimeRange.value.value
    return [
      getChartDataByTimeRange(props.priceChartData[0], timeRangeValue),
      getChartDataByTimeRange(props.priceChartData[1], timeRangeValue),
    ]
  } else {
    return []
  }
})

const getChartDataByTimeRange = (data: [Date, number][], timeRange: number) => {
  if (!data) {
    return
  }
  if (timeRange === 0) {
    return data
  } else {
    const now = new Date()
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - selectedTimeRange.value.value
    )
    return data.filter((item) => item[0] >= startDate)
  }
}

const getPriceChartData = () => {
  Chart?.destroy()
  const priceChartData = displayChartData.value

  if (priceChartData?.length) {
    const ctx = (
      document?.getElementById('priceChart') as HTMLCanvasElement
    )?.getContext('2d')
    if (ctx) {
      const commonStyle = {
        tension: 0.2,
        pointRadius: 6,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: isDarkMode.value ? '#181717' : 'white',
        borderJoinStyle: 'round' as const,
        radius: 0,
        pointStyle: 'rect',
        borderWidth: 1,
        lineTension: 0,
      }
      const chart = new ChartJS(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Sale',
              data: getChartData(priceChartData[0]),
              borderColor: '#FF7AC3',
              pointBackgroundColor: '#FF7AC3',
              pointBorderColor: '#FF7AC3',
              ...commonStyle,
            },
            {
              label: 'List',
              data: getChartData(priceChartData[1]),
              borderColor: '#6188E7',
              pointBackgroundColor: '#6188E7',
              pointBorderColor: '#6188E7',
              ...commonStyle,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          responsive: true,
          responsiveAnimationDuration: 0,
          transitions: {
            resize: {
              animation: {
                duration: 0,
              },
            },
          },
          plugins: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            customCanvasBackgroundColor: {
              color: isDarkMode.value ? '#181717' : 'white',
            },
            legend: {
              labels: {
                usePointStyle: true,
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `Price: ${context.parsed.y} ${chainSymbol.value}`
                },
                title: function (context) {
                  return format(context[0].parsed.x, 'MMM dd HH:mm')
                },
              },
            },
            zoom: {
              limits: {
                x: { min: 0, minRange: 0 },
                y: { min: 0, minRange: 0 },
              },
              pan: {
                enabled: false,
              },
              zoom: {
                wheel: {
                  enabled: false,
                },
                pinch: {
                  enabled: false,
                },
                mode: 'xy',
                onZoomComplete({ chart }) {
                  chart.update('none')
                },
              },
            },
          },
          scales: {
            x: {
              type: 'time',
              time: {
                displayFormats: {
                  hour: 'HH:mm',
                  minute: 'HH:mm',
                },
                unit: 'hour',
              },
              grid: {
                drawOnChartArea: false,
                borderColor: lineColor.value,
                color: gridColor.value,
              },
              ticks: {
                callback: (value) => {
                  return value
                },
                major: {
                  enabled: true,
                },
                maxRotation: 0,
                minRotation: 0,
                color: lineColor.value,
              },
            },
            y: {
              ticks: {
                callback: (value) => {
                  return `${Number(value).toFixed(2)}  `
                },
                stepSize: 3,
                color: lineColor.value,
              },
              grid: {
                drawTicks: false,
                color: gridColor.value,
                borderColor: lineColor.value,
              },
            },
          },
        },
        plugins: [
          {
            id: 'customCanvasBackgroundColor',
            beforeDraw: (chart, args, options) => {
              const { ctx } = chart
              ctx.save()
              ctx.globalCompositeOperation = 'destination-over'
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              ctx.fillStyle = options.color || '#FFFFFF'
              ctx.fillRect(0, 0, chart.width, chart.height)
              ctx.restore()
            },
          },
        ],
      })

      Chart = chart
    }
  }
}
watch(
  () => props.priceChartData,
  () => {
    getPriceChartData()
  }
)
watch([isDarkMode, selectedTimeRange], () => {
  getPriceChartData()
})
</script>

<style scoped>
.content {
  height: 15rem;
}
</style>
