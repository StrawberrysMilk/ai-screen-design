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

const { data } = useDataSource(dataId)

const option = computed(() => {
  const _option = props.schema.props.option
  return {
    ..._option,
    dataset: {
      ..._option.dataset,
      // 重写 source，如果数据源中存在这份数据，就使用，否则使用自带的
      source: data.value.length ? data.value : _option.dataset.source,
    },
  }
})

watch(
  option,
  (newVal) => {
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
</script>

<template>
  <div class="chart-material w-full h-full" ref="chartRef"></div>
</template>

<style scoped lang="scss"></style>
