import type { MaterialDefinition } from '@/materials/type.ts'
import ChartsMaterial from '@/materials/charts/component.vue'

const chartMaterial: MaterialDefinition = {
  name: '柱状图',
  icon: 'fluent-color:list-bar-16',
  group: 'charts',
  schema: {
    type: 'charts',
    name: '柱状图',
    layout: {
      x: 0,
      y: 0,
      width: 300,
      height: 200,
    },
    props: {
      option: {},
    },
  },
}

export function install(register) {
  register(chartMaterial, ChartsMaterial)
}
