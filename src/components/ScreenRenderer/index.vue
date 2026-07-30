<script setup lang="ts">
import type { MaterialSchema } from '@/schema/material.ts'
import { getMaterialComponent } from '@/materials'
import type { PageSchema } from '@/schema/page.ts'
import { createRuntimeContext } from '@/runtime/context.ts'

defineOptions({
  name: 'ScreenRenderer',
})
const props = defineProps<{ page: PageSchema }>()

const runtimePage = ref(props.page)

const context = createRuntimeContext(runtimePage)
// // @ts-expect-error 忽略，先挂着window 测试使用
// window.$context = context
// console.log(context, 'context')

const nodes = computed(() => runtimePage.value.nodes || [])
const canvas = computed(
  () => runtimePage.value.canvas || { width: 1920, height: 1080, backgroundColor: '#fff' },
)
const dataSources = computed(() => runtimePage.value.dataSources || [])

const scale = ref(1)
const left = ref(0)
const top = ref(0)

provide('dataSources', dataSources)

const canvasStyle = computed(() => {
  return {
    width: canvas.value.width + 'px',
    height: canvas.value.height + 'px',
    backgroundColor: canvas.value.backgroundColor,
    transform: `translate(${left.value}px, ${top.value}px) scale(${scale.value})`,
    transformOrigin: 'left top',
  }
})

function getNodeStyle(node: MaterialSchema, index: number) {
  return {
    left: `${node.layout.x}px`,
    top: `${node.layout.y}px`,
    width: `${node.layout.width}px`,
    height: `${node.layout.height}px`,
    zIndex: index + 1,
  }
}

function init() {
  const x = window.innerWidth / canvas.value.width
  const y = window.innerHeight / canvas.value.height
  // 取最小的缩放比例，保证画布完整显示
  scale.value = Math.min(x, y)
  // 计算画布居中位置
  left.value = (window.innerWidth - canvas.value.width * scale.value) / 2
  top.value = (window.innerHeight - canvas.value.height * scale.value) / 2
}

const vm = getCurrentInstance()

/**
 * 注册节点实例，方便在运行时获取节点实例
 */
function registerNodeInstance() {
  const refs = {}
  for (const key in vm.refs) {
    refs[key] = vm.refs[key][0]
  }
  context.registerNodeInstance(refs)
}

/**
 * 创建组件事件绑定
 */
function creatEvents(node: MaterialSchema) {
  const listeners = {}
  const events = node.events || []
  events.forEach((event) => {
    // {
    //   // 事件类型 click
    //   type: 'click',
    //     name: 'fn',
    //   code: `console.log('123')`,
    // },
    listeners[event.type] = () => {
      const fn = new Function('$context', '$node', event.code)
      fn(context, node)
    }
  })

  return listeners
}

onMounted(() => {
  registerNodeInstance()
  init()
  addEventListener('resize', init)

  onBeforeUnmount(() => {
    removeEventListener('resize', init)
  })
})
</script>

<template>
  <div class="preview-container">
    <div class="canvas-root" :style="canvasStyle">
      <div
        class="canvas-node"
        v-for="(node, index) in nodes"
        :key="node.id"
        :style="getNodeStyle(node, index)"
      >
        <component
          :ref="node.id"
          :is="getMaterialComponent(node.type)"
          :schema="node"
          v-on="creatEvents(node)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.preview-container {
  width: 100vw;
  height: 100vh;
  .canvas-root {
    position: relative;
    .canvas-node {
      position: absolute;
    }
  }
}
</style>
