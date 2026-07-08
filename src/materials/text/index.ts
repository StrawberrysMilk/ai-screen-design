import type { MaterialDefinition } from '@/materials/type.ts'

const textMaterial: MaterialDefinition = {
  name: '文本',
  icon: 'solar:text-bold',
  group: 'info',
  schema: {
    type: 'text',
    name: '普通文本',
    layout: {
      x: 0,
      y: 0,
      width: 300,
      height: 50,
    },
    style: {
      color: 'black',
    },
    props: {
      content: 'hello world',
    },
  },
}

export function install(register) {
  register(textMaterial)
}
