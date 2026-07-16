<script setup lang="ts">
import { createNode, getMaterialComponent } from '@/materials'
import Moveable, { type OnResize, type OnResizeGroup } from 'vue3-moveable'
import { storeToRefs } from 'pinia'
import { useEditorStore } from '@/stores/editor.ts'
import Selecto from 'vue3-selecto'
import SketchRuler from 'vue3-sketch-ruler'
import 'vue3-sketch-ruler/lib/style.css'
import type { MaterialSchema } from '@/schema/material.ts'
import { useCanvasRuler } from '@/editor/canvas/composables/useCanvasRuler.ts'
import { useMoveable } from '@/editor/canvas/composables/useMoveable.ts'
import { useSelection } from '@/editor/canvas/composables/useSelection.ts'

defineOptions({
  name: 'CanvasRoot',
})

const editorStore = useEditorStore()

const { nodes } = storeToRefs(editorStore)

const moveableRef = useTemplateRef('moveable')
const stageRef = useTemplateRef('stage')
const canvasRootRef = useTemplateRef('canvasRoot')

const {
  canvasWidth,
  canvasHeight,
  canvasStyle,
  lines,
  rectWidth,
  rectHight,
  scale,
  palette,
  onZoomChange,
} = useCanvasRuler({ canvasRootRef, moveableRef })

const { onDrag, OnResize, onDragGroup, OnResizeGroup, onStart, onEnd } = useMoveable(moveableRef)

const { onSelect, onClearSelected, onSelectEnd, selectedTagrt } = useSelection({
  moveableRef,
  stageRef,
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
      @dragStart="onStart"
      @dragEnd="onEnd"
      @dragGroup="onDragGroup"
      @dragGroupStart="onStart"
      @dragGroupEnd="onEnd"
      @resize="OnResize"
      @resizeStart="onStart"
      @resizeEnd="onEnd"
      @resizeGroup="OnResizeGroup"
      @resizeGroupStart="onStart"
      @resizeGroupEnd="onEnd"
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
