import TextMaterial from '@/materials/text/component.vue'
import type { MaterialDefinition } from '@/schema/material.ts'

const textMaterial: MaterialDefinition = {
  name: '文本',
  icon: 'solar:text-bold',
  group: 'info',
  setters: [
    {
      type: 'input', // el-input
      label: '内容',
      key: 'props.content',
    },
    {
      type: 'color', // el-color-picker
      label: '颜色',
      key: 'style.color',
    },
    {
      type: 'number', // el-input-number
      label: '字号',
      key: 'style.fontSize',
    },
  ],
  schema: {
    type: 'text',
    name: '普通文本',
    locked: false,
    layout: {
      x: 0,
      y: 0,
      width: 300,
      height: 50,
    },
    style: {
      color: 'white',
      fontSize: 16,
    },
    props: {
      content: 'hello world',
    },
  },
}

export function install(register) {
  register(textMaterial, TextMaterial)
}
