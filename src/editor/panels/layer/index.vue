<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useEditorStore } from '@/stores/editor.ts'
import { useDraggable } from 'vue-draggable-plus'

defineOptions({
  name: 'LayerPanel',
})

const editorStore = useEditorStore()

const { nodes, selectedNodeIds } = storeToRefs(editorStore)
useDraggable('.layer-panel', nodes, { animation: 150, direction: 'horizontal' })
</script>

<template>
  <div class="h-full">
    <div class="h-full layer-panel p-[10px] overflow-auto">
      <div
        class="flex justify-between items-center px-[10px] h-[30px] border-b border-[var(--border-color)] text-[12px] rounded-[4px] cursor-pointer mt-[4px]"
        v-for="node in nodes"
        :key="node.id"
        :class="{ active: selectedNodeIds.includes(node.id) }"
        @click="editorStore.selectNode(node.id)"
      >
        <span> {{ node.name }} </span>
        <span><Icon icon="fluent:list-bar-24-filled" /></span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.layer-panel {
  background: bg-mix(50);
  display: flex;
  flex-direction: column-reverse;
  justify-content: start;
  & > div {
    background: bg-mix(30);
    &.active {
      background: #0e8da7;
    }
  }
}
</style>
