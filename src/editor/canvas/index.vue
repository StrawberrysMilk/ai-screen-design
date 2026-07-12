<script setup lang="ts">
import type { MaterialSchema } from '@/materials/type.ts'
import { createNode, getMaterialComponent } from '@/materials'
import Moveable, {
  type OnDrag,
  type OnDragGroup,
  type OnResize,
  type OnResizeGroup,
} from 'vue3-moveable'
import { storeToRefs } from 'pinia'
import { useEditorStore } from '@/stores/editor.ts'
import Selecto from 'vue3-selecto'

defineOptions({
  name: 'CanvasRoot',
})

const editorStore = useEditorStore()

const { nodes } = storeToRefs(editorStore)

const moveableRef = useTemplateRef('moveable')
const stageRef = useTemplateRef('stage')

const selectedTagrt = shallowRef<HTMLElement>()

const vm = getCurrentInstance()

function onDrop(e: DragEvent) {
  const data = e.dataTransfer.getData('schema')
  const node = createNode(JSON.parse(data))
  const stageRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  node.layout.x = e.clientX - stageRect.left - node.layout.width / 2
  node.layout.y = e.clientY - stageRect.top - node.layout.height / 2
  editorStore.addNode(node)
  editorStore.selectNode(node.id)
  // 这个时候还没渲染出来
  nextTick(() => {
    selectedTagrt.value = vm.proxy.$el.querySelector(`[data-node-id='${node.id}']`) as HTMLElement
  })
}

/**
 * 移动：改css top left
 * 尺寸：改 css height width
 * @param node
 */
function getNodeStyle(node: MaterialSchema) {
  return {
    left: `${node.layout.x}px`,
    top: `${node.layout.y}px`,
    width: `${node.layout.width}px`,
    height: `${node.layout.height}px`,
  }
}

function onSelect(node: MaterialSchema, e: MouseEvent) {
  selectedTagrt.value = e.currentTarget as HTMLElement
  editorStore.selectNode(node.id)

  nextTick(() => {
    moveableRef.value.dragStart(e)
  })
}

function getNodeByTarget(element: HTMLElement) {
  const id = element.getAttribute('data-node-id')
  return editorStore.findNode(id)
}

function onDrag(e: OnDrag) {
  e.target.style.left = `${e.left}px`
  e.target.style.top = `${e.top}px`
  const node = getNodeByTarget(e.target as HTMLElement)
  node.layout.x = e.left
  node.layout.y = e.top
}

function OnResize(e: OnResize) {
  e.target.style.width = `${e.width}px`
  e.target.style.height = `${e.height}px`
  const node = getNodeByTarget(e.target as HTMLElement)
  node.layout.width = e.width
  node.layout.height = e.height
  onDrag(e.drag)
}

function onClearSelected() {
  editorStore.clearSelected()
  selectedTagrt.value = null
}

function onSelectEnd(e) {
  selectedTagrt.value = e.selected
  const ids = e.selected.map((el) => el.getAttribute('data-node-id'))
  editorStore.selectNodes(ids)
}

/**
 * 拖动多个元素
 * @param e
 */
function onDragGroup(e: OnDragGroup) {
  e.events.forEach(onDrag)
}

/**
 * 调整多个元素大小
 * @param e
 * @constructor
 */
function OnResizeGroup(e: OnResizeGroup) {
  e.events.forEach(OnResize)
}
</script>

<template>
  <div class="canvas-root">
    <div
      ref="stage"
      class="canvas-stage w-900 h-600 m-100"
      @dragover.prevent
      @drop="onDrop"
      @mousedown.self="onClearSelected"
    >
      <div
        v-for="node in nodes"
        :key="node.id"
        class="canvas-node absolute"
        :style="getNodeStyle(node)"
        :data-node-id="node.id"
        @mousedown="onSelect(node, $event)"
      >
        <component :is="getMaterialComponent(node.type)" :schema="node" />
      </div>
    </div>
    <Selecto
      v-if="stageRef"
      :container="stageRef"
      :dragContainer="stageRef"
      :selectableTargets="['.canvas-node']"
      :selectFromInside="false"
      :toggleContinueSelect="'shift'"
      @selectEnd="onSelectEnd"
    />
    <Moveable
      ref="moveable"
      :target="selectedTagrt"
      :draggable="true"
      :resizable="true"
      :origin="false"
      @drag="onDrag"
      @dragGroup="onDragGroup"
      @resize="OnResize"
      @resizeGroup="OnResizeGroup"
    />
  </div>
</template>

<style scoped lang="scss">
.canvas-root {
  .canvas-stage {
    position: relative;
    background: bg-mix(60);
    .canvas-node {
    }
  }
}
</style>
