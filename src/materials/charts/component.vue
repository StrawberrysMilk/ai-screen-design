<script setup lang="ts">
import type { MaterialSchema } from '@/schema/material.ts'
import { init, type EChartsType } from 'echarts'

defineOptions({
  name: 'ChartMaterial',
})
const props = defineProps<{ schema: MaterialSchema }>()

const chartRef = useTemplateRef('chartRef')

let chart: EChartsType
watch(
  () => props.schema.props.option,
  () => {
    chart.setOption(props.schema.props.option)
  },
  { deep: true },
)

onMounted(() => {
  chart = init(chartRef.value)
  chart.setOption(props.schema.props.option)

  const observer = new ResizeObserver(() => {
    // dom发送变化后
    chart.resize()
  })
  observer.observe(chartRef.value)

  onBeforeUnmount(() => {
    observer.disconnect()
    chart.dispose()
  })
})
</script>

<template>
  <div class="chart-material w-full h-full" ref="chartRef"></div>
</template>

<style scoped lang="scss"></style>
