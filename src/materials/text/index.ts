import type { MaterialDefinition } from '@/schema/material.ts'
import TextMaterial from './component.vue'
import { TextSchema } from '@/materials/text/schema.ts'

const textMaterial: MaterialDefinition = {
  // 物料元数据
  name: '文本',
  group: 'info',
  icon: 'solar:text-bold',
  // ...
  configSchema: TextSchema,
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
      type: 'number', // el-color-picker
      label: '字号',
      key: 'style.fontSize',
    },
  ],
  eventOptions: [
    {
      label: '点击事件',
      value: 'click',
      trigger: '当用户点击组件时触发',
      payload: 'MouseEvent，鼠标事件对象',
    },
    {
      label: '双击事件',
      value: 'dblclick',
      trigger: '当用户双击组件时触发',
      payload: 'MouseEvent，鼠标事件对象',
    },
    {
      label: '组件挂载',
      value: 'vnodeMounted',
      trigger: '当组件挂载时触发',
      payload: '',
    },
  ],
  schema: {
    // dsl
    type: 'text',
    name: '普通文本',
    layout: {
      x: 0,
      y: 0,
      width: 300,
      height: 50,
    },
    style: {
      color: '#fff',
      fontSize: 16,
    },
    props: {
      content: 'hello world',
    },
    events: [
      {
        // 点击事件
        type: 'click',
        name: 'fn',
        title: '点击事件',
        code: ``,
      },
    ],
  },
}

export function install(register) {
  register(textMaterial, TextMaterial)
}
