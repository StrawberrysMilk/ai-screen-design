<script setup lang="ts">
import type { MaterialSchema } from '@/materials/type.ts'
import { createNode, getMaterialComponent } from '@/materials'

defineOptions({
  name: 'CanvasRoot',
})

const nodes = ref<MaterialSchema[]>([])

function onDrop(e: DragEvent) {
  const data = e.dataTransfer.getData('schema')
  const node = createNode(JSON.parse(data))
  nodes.value.push(node)
}
</script>

<template>
  <div class="canvas-root">
    <div class="canvas-stage w-900 h-600 m-100" @dragover.prevent @drop="onDrop">
      <div v-for="node in nodes" :key="node.id" class="canvas-node">
        <component :is="getMaterialComponent(node.type)" :schema="node" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.canvas-root {
  .canvas-stage {
    background: bg-mix(60);
  }
}
</style>
