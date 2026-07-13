import ChartsMaterial from '@/materials/charts/component.vue'
import type { MaterialDefinition } from '@/schema/material.ts'

const chartMaterial: MaterialDefinition = {
  name: '柱状图',
  icon: 'fluent-color:list-bar-16',
  group: 'charts',
  setters: [],
  schema: {
    type: 'charts',
    name: '柱状图',
    locked: false,
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
