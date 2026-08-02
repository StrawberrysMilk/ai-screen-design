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
  eventOptions: [
    { label: '点击事件', value: 'click' },
    { label: '双击事件', value: 'dblclick' },
    { label: '鼠标按下', value: 'mousedown' },
    { label: '鼠标抬起', value: 'mouseup' },
    { label: '鼠标移入', value: 'mouseenter' },
    { label: '鼠标移出', value: 'mouseleave' },
    { label: '鼠标移动', value: 'mousemove' },
    { label: '鼠标滚轮', value: 'mousewheel' },
    { label: '键盘按下', value: 'keydown' },
    { label: '键盘抬起', value: 'keyup' },
    { label: '组件挂载时', value: 'vnodeMounted' },
    { label: 'foo', value: 'foo' },
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
    events: [
      {
        // 事件类型 click
        type: 'click',
        name: 'fn',
        code: `$context.refreshNodesByDataId('568')`,
        title: '点击事件',
        // code: `$node.props.content = '你好呀'`,
      },
    ],
  },
}

export function install(register) {
  register(textMaterial, TextMaterial)
}
