import { storeToRefs } from 'pinia'
import { useEditorStore } from '@/stores/editor.ts'
import type { MaterialSchema } from '@/schema/material.ts'

export function useSelection({ stageRef, moveableRef }) {
  const editorStore = useEditorStore()
  const { selectedNodeIds } = storeToRefs(editorStore)

  const selectedTagrt = shallowRef<HTMLElement[]>()

  const vm = getCurrentInstance()

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

  function onSelect(node: MaterialSchema, e: MouseEvent) {
    editorStore.selectNode(node.id)

    nextTick(() => {
      moveableRef.value.dragStart(e)
    })
  }

  function onClearSelected() {
    editorStore.clearSelected()
  }

  function onSelectEnd(e) {
    const ids = e.selected.map((el) => el.getAttribute('data-node-id'))
    editorStore.selectNodes(ids)
  }
  return {
    onSelect,
    onClearSelected,
    onSelectEnd,
    selectedTagrt,
  }
}
