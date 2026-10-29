<script setup lang="ts">
import type { MaterialSchema } from '@/schema/material.ts'
import { createNode, getMaterialComponent } from '@/materials'
import Moveable from 'vue3-moveable'
import Selecto from 'vue3-selecto'
import SketchRuler from 'vue3-sketch-ruler'
import 'vue3-sketch-ruler/lib/style.css'

import { useEditorStore } from '@/stores/editor.ts'
import { storeToRefs } from 'pinia'
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
  rectHeight,
  rectWidth,
  lines,
  scale,
  palette,
  onZoomChange,
} = useCanvasRuler({ canvasRootRef, moveableRef })

const { onResize, onDrag, onResizeGroup, onDragGroup, onStart, onEnd } = useMoveable(moveableRef)

const { onSelect, onSelectEnd, onClearSelected, selectedTarget } = useSelection({
  moveableRef,
  stageRef,
})

function onDrop(e: DragEvent) {
  const data = e.dataTransfer.getData('schema')
  const node = createNode(JSON.parse(data))
  node.layout.x = e.offsetX - node.layout.width / 2
  node.layout.y = e.offsetY - node.layout.height / 2

  editorStore.addNode(node)

  editorStore.selectNode(node.id)
}

function getNodeStyle(node: MaterialSchema, index: number) {
  return {
    width: node.layout.width + 'px',
    height: node.layout.height + 'px',
    left: node.layout.x + 'px',
    top: node.layout.y + 'px',
    zIndex: index + 1,
  }
}

const commandMap = {
  copy: () => editorStore.copyNode(editorStore.selectedNode),
  remove: () => editorStore.removeNode(editorStore.selectedNode),
  moveBottom: () => editorStore.moveTop(editorStore.selectedNode),
  moveTop: () => editorStore.moveBottom(editorStore.selectedNode),
  toggleLock: () => {
    editorStore.toggleLock(editorStore.selectedNode)
    selectedTarget.value = []
  },
}

function onCommand(command: string) {
  commandMap[command]()
}
</script>

<template>
  <div class="canvas-root" ref="canvasRoot">
    <SketchRuler
      v-model:scale="scale"
      :thick="20"
      :palette="palette"
      :width="rectWidth"
      :height="rectHeight"
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
            class="canvas-node"
            :style="getNodeStyle(node, index)"
            :data-node-id="node.id"
            :data-node-locked="node.locked"
            @mousedown="onSelect(node, $event)"
          >
            <component :is="getMaterialComponent(node.type)" :schema="node"></component>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="copy">复制</el-dropdown-item>
              <el-dropdown-item command="remove">移除</el-dropdown-item>
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
      :selectFromInside="false"
      toggleContinueSelect="shift"
      :selectableTargets="['.canvas-node']"
      @selectEnd="onSelectEnd"
    ></Selecto>
    <Moveable
      ref="moveable"
      :target="selectedTarget"
      :draggable="true"
      :resizable="true"
      :origin="false"
      @drag="onDrag"
      @dragStart="onStart"
      @dragEnd="onEnd"
      @dragGroup="onDragGroup"
      @dragGroupStart="onStart"
      @dragGroupEnd="onEnd"
      @resize="onResize"
      @resizeGroup="onResizeGroup"
      @resizeStart="onStart"
      @resizeEnd="onEnd"
      @resizeGroupStart="onStart"
      @resizeGroupEnd="onEnd"
    ></Moveable>
  </div>
</template>

<style scoped lang="scss">
.canvas-root {
  position: relative;
  overflow: hidden;
  // 创建新的层级上下文
  isolation: isolate;
  .canvas-stage {
    position: relative;
    .canvas-node {
      position: absolute;
    }
  }
}
</style>
