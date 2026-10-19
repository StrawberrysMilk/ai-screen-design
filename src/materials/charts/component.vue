<script setup lang="ts">
import type { MaterialSchema } from '@/schema/material.ts'
import { init, type EChartsType } from 'echarts'
import { useEditorStore } from '@/stores/editor.ts'
import { storeToRefs } from 'pinia'
import type { DataSourceSchema } from '@/schema/page.ts'
import { useDataSource } from '@/composables/useDataSource.ts'

defineOptions({
  name: 'ChartMaterial',
})
const props = defineProps<{ schema: MaterialSchema }>()

/**
 * 物料状态来源
 * 1. 编辑时的状态 ==》 编辑器在用的时候
 * 2. 运行时的状态 ==》 渲染器在用的时候
 */

const chartRef = useTemplateRef('chartRef')

let chart: EChartsType

const dataId = computed(() => props.schema.dataId)

const { data, loading, error, refresh } = useDataSource(dataId)

const option = computed(() => {
  const _option = props.schema.props?.option ?? {}
  const configuredDataset = _option.dataset
  const source = data.value ?? configuredDataset?.source

  // AI 生成的图表配置可能没有 dataset。只有存在数据时才注入 dataset，
  // 否则保留原始 option，避免读取 undefined.source 导致组件渲染失败。
  if (source === undefined) {
    return _option
  }

  return {
    ..._option,
    dataset: {
      ...configuredDataset,
      source,
    },
  }
})

watch(
  option,
  (newVal) => {
    if (!chart) return
    chart.setOption(newVal)
  },
  { deep: true },
)

onMounted(() => {
  chart = init(chartRef.value)
  chart.setOption(option.value)

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
defineExpose({
  refresh,
})
</script>

<template>
  <div v-loading="loading" class="chart-material w-full h-full" ref="chartRef"></div>
</template>

<style scoped lang="scss"></style>
