import { useEditorStore } from '@/stores/editor.ts'
import { storeToRefs } from 'pinia'
import { type OnDrag, type OnDragGroup, type OnResize, type OnResizeGroup } from 'vue3-moveable'
import { useUndoRedo } from '@/composables/useUndoRedo.ts'

export function useMoveable(moveableRef) {
  const editorStore = useEditorStore()
  const { canvas } = storeToRefs(editorStore)
  const { applyChange, startBatch, commitBatch } = useUndoRedo()

  function getNodeByTarget(element: HTMLElement) {
    const id = element.getAttribute('data-node-id')
    return editorStore.findNode(id)
  }

  // 当 layout 发送变化后，手动变更 moveable 的选框
  watch(
    () =>
      editorStore.nodes.map((node) => {
        return node.layout
      }),
    () => {
      // 手动更新方法
      moveableRef.value.updateRect(undefined, true)
    },
    {
      flush: 'post',
    },
  )

  function onStart() {
    startBatch()
  }

  function onEnd() {
    commitBatch()
  }

  function onDrag(e: OnDrag) {
    e.target.style.left = `${e.left}px`
    e.target.style.top = `${e.top}px`
    const node = getNodeByTarget(e.target as HTMLElement)
    applyChange(node, 'layout', { ...node.layout, x: e.left, y: e.top })
  }

  function OnResize(e: OnResize) {
    e.target.style.width = `${e.width}px`
    e.target.style.height = `${e.height}px`
    const node = getNodeByTarget(e.target as HTMLElement)
    applyChange(node, 'layout', { ...node.layout, width: e.width, height: e.height })
    onDrag(e.drag)
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

  return {
    onDrag,
    OnResize,
    onDragGroup,
    OnResizeGroup,
    onStart,
    onEnd,
  }
}
