import type { OnDrag, OnDragGroup, OnResize, OnResizeGroup } from 'vue3-moveable'
import { useEditorStore } from '@/stores/editor.ts'
import { useUndoRedo } from '@/composables/useUndoRedo.ts'

export function useMoveable(moveableRef) {
  const editorStore = useEditorStore()
  const { applyChange, startBatch, commitBatch } = useUndoRedo()

  function getNodeByTarget(element: HTMLElement) {
    const id = element.getAttribute('data-node-id')
    return editorStore.findNode(id)
  }

  // 当 layout 发生变化后，手动更新 moveable 的选框
  watch(
    () =>
      editorStore.nodes.map((node) => {
        return node.layout
      }),
    () => {
      // 手动更新的方法
      moveableRef.value.updateRect(undefined, true)
    },
    {
      flush: 'post',
    },
  )

  function onStart() {
    console.log('resizeStart')
    startBatch()
  }

  function onEnd() {
    commitBatch()
  }

  function onDrag(e: OnDrag) {
    e.target.style.left = e.left + 'px'
    e.target.style.top = e.top + 'px'
    const node = getNodeByTarget(e.target as HTMLElement)
    applyChange(node, 'layout', {
      ...node.layout,
      x: e.left,
      y: e.top,
    })
  }

  function onResize(e: OnResize) {
    e.target.style.width = e.width + 'px'
    e.target.style.height = e.height + 'px'
    const node = getNodeByTarget(e.target as HTMLElement)
    node.layout.width = e.width
    node.layout.height = e.height
    applyChange(node, 'layout', {
      ...node.layout,
      width: e.width,
      height: e.height,
    })
    onDrag(e.drag)
  }

  function onDragGroup(e: OnDragGroup) {
    e.events.forEach(onDrag)
  }

  function onResizeGroup(e: OnResizeGroup) {
    e.events.forEach(onResize)
  }

  return {
    onResize,
    onDrag,
    onResizeGroup,
    onDragGroup,
    onStart,
    onEnd,
  }
}
