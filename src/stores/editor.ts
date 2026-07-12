import { defineStore } from 'pinia'
import type { MaterialSchema } from '@/materials/type.ts'

export const useEditorStore = defineStore('editor', () => {
  const panelVisible = reactive({
    material: true,
    layer: true,
    property: true,
  })

  /**
   * 当前编辑器中组件的列表
   */
  const nodes = ref<MaterialSchema[]>([])

  const selectedNodeIds = ref([])

  /**
   * 当前选中节点id
   * 多选的情况下 为 null
   */
  const selectedNodeId = computed(() => {
    return selectedNodeIds.value.length === 1 ? selectedNodeIds.value[0] : null
  })

  /**
   * 当前选中节点
   */
  const selectedNode = computed(() => {
    return nodes.value.find((node) => node.id === selectedNodeId.value)
  })

  function addNode(node: MaterialSchema) {
    nodes.value.push(node)
  }

  /**
   * 单选方法
   * @param id
   */
  function selectNode(id: string) {
    selectedNodeIds.value = [id]
  }

  function selectNodes(ids: string[]) {
    selectedNodeIds.value = ids
  }

  function deleteNode(id: string) {
    nodes.value = nodes.value.filter((node) => node.id !== id)
    if (selectedNodeId.value === id) {
      clearSelected()
    }
  }

  function findNode(id: string) {
    return nodes.value.find((node) => node.id === id)
  }

  function clearSelected() {
    selectedNodeIds.value = []
  }

  return {
    panelVisible,
    nodes,
    selectedNodeId,
    selectedNodeIds,
    selectedNode,
    addNode,
    selectNode,
    selectNodes,
    deleteNode,
    findNode,
    clearSelected,
  }
})
