<script setup lang="ts">
import type { MaterialSchema } from '@/schema/material.ts'
import { getMaterialComponent } from '@/materials'
import type { PageSchema } from '@/schema/page.ts'

defineOptions({
  name: 'ScreenRenderer',
})
const props = defineProps<{ page: PageSchema }>()
const nodes = computed(() => props.page.nodes || [])
const canvas = computed(
  () => props.page.canvas || { width: 1920, height: 1080, backgroundColor: '#fff' },
)
const dataSources = computed(() => props.page.dataSources || [])

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

onMounted(() => {
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
        <component :is="getMaterialComponent(node.type)" :schema="node" />
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
