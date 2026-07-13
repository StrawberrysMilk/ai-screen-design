<script setup lang="ts">
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
import SketchRuler from 'vue3-sketch-ruler'
import 'vue3-sketch-ruler/lib/style.css'
import { debounce } from '@/utils'
import type { MaterialSchema } from '@/schema/material.ts'

defineOptions({
  name: 'CanvasRoot',
})

const editorStore = useEditorStore()

const { nodes, selectedNodeIds, canvas } = storeToRefs(editorStore)

const moveableRef = useTemplateRef('moveable')
const stageRef = useTemplateRef('stage')
const canvasRootRef = useTemplateRef('canvasRoot')

const selectedTagrt = shallowRef<HTMLElement[]>()

const vm = getCurrentInstance()

const canvasWidth = toRef(canvas.value, 'width')
const canvasHeight = toRef(canvas.value, 'height')

const canvasStyle = computed(() => {
  return {
    width: `${canvasWidth.value}px`,
    height: `${canvasHeight.value}px`,
    backgroundColor: canvas.value.backgroundColor,
  }
})

const lines = ref({ h: [], v: [] })
const rectWidth = ref(1000)
const rectHight = ref(800)
const scale = ref(1)

const palette = {
  bgColor: '#1f2937',
  longfgColor: '#6b7280',
  fontColor: '#9ca3af',
  fontShadowColor: 'rgba(14, 141, 167, 0.14)',
  lineColor: '#22c55e',
  lineType: 'solid',
  lockLineColor: '#4b5563',
  borderColor: '#374151',
  hoverBg: '#111827',
  hoverColor: '#ffffff',
}

watch(
  selectedNodeIds,
  (ids) => {
    selectedTagrt.value = ids.map((id) => {
      return stageRef.value.querySelector(
        `[data-node-id='${id}']:not([data-node-locked='true'])`,
      ) as HTMLElement
    })
  },
  { deep: true, flush: 'post' },
)

const onRootResize = debounce((rect) => {
  rectWidth.value = rect.width
  rectHight.value = rect.height
}, 300)

onMounted(() => {
  const { width, height } = canvasRootRef.value.getBoundingClientRect()
  rectWidth.value = width
  rectHight.value = height

  const ob = new ResizeObserver((entries) => {
    const entry = entries[0]
    const rect = entry.contentRect
    onRootResize(rect)
  })
  ob.observe(canvasRootRef.value)

  onUnmounted(() => {
    ob.disconnect()
  })
})

/**
 * 拖拽放置元素
 * @param e
 */
function onDrop(e: DragEvent) {
  const data = e.dataTransfer.getData('schema')
  const node = createNode(JSON.parse(data))
  const stageRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  node.layout.x = e.clientX - stageRect.left - node.layout.width / 2
  node.layout.y = e.clientY - stageRect.top - node.layout.height / 2
  editorStore.addNode(node)
  editorStore.selectNode(node.id)
}

/**
 * 移动：改css top left
 * 尺寸：改 css height width
 * @param node
 */
function getNodeStyle(node: MaterialSchema, index: number) {
  return {
    left: `${node.layout.x}px`,
    top: `${node.layout.y}px`,
    width: `${node.layout.width}px`,
    height: `${node.layout.height}px`,
    zIndex: index + 1,
  }
}

function onSelect(node: MaterialSchema, e: MouseEvent) {
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
}

function onSelectEnd(e) {
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

/**
 * 缩放改变时，更新moveable的rect
 */
function onZoomChange() {
  moveableRef.value.updateRect()
}

const commandMap = {
  copy: () => editorStore.copyNode(editorStore.selectedNode),
  move: () => editorStore.removeNode(editorStore.selectedNode),
  moveTop: () => editorStore.moveBottom(editorStore.selectedNode),
  moveBottom: () => editorStore.moveTop(editorStore.selectedNode),
  toggleLock: () => {
    editorStore.toggleLock(editorStore.selectedNode)
    selectedTagrt.value = []
  },
}

function onCommand(command: string) {
  const fn = commandMap[command]
  if (fn) {
    fn()
  }
}
</script>

<template>
  <div class="canvas-root" ref="canvasRoot">
    <SketchRuler
      v-model:scale="scale"
      :thick="20"
      :palette="palette"
      :width="rectWidth"
      :height="rectHight"
      :canvasWidth="canvasWidth"
      :canvasHeight="canvasHeight"
      :lines="lines"
      @zoomchange="onZoomChange"
    >
      <div
        ref="stage"
        class="canvas-stage"
        :style="canvasStyle"
        @dragover.prevent
        @drop="onDrop"
        @mousedown.self="onClearSelected"
      >
        <el-dropdown
          v-for="(node, index) in nodes"
          :key="node.id"
          trigger="contextmenu"
          @command="onCommand"
        >
          <div
            class="canvas-node absolute"
            :style="getNodeStyle(node, index)"
            :data-node-id="node.id"
            :data-node-locked="node.locked"
            @mousedown="onSelect(node, $event)"
          >
            <component :is="getMaterialComponent(node.type)" :schema="node" />
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="copy">复制</el-dropdown-item>
              <el-dropdown-item command="move">删除</el-dropdown-item>
              <el-dropdown-item command="moveTop">置顶</el-dropdown-item>
              <el-dropdown-item command="moveBottom">置底</el-dropdown-item>
              <el-dropdown-item command="toggleLock">{{
                node.locked ? '解锁' : '锁定'
              }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </SketchRuler>
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
    .canvas-node {
    }
  }
}
</style>
