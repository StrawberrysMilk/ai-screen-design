import { defineStore } from 'pinia'

import type { MaterialSchema } from '@/schema/material.ts'
import type { PageSchema } from '@/schema/page.ts'
import { useUndoRedo } from '@/composables/useUndoRedo.ts'

export const useEditorStore = defineStore('editor', () => {
  const { redo, undo, applyChange } = useUndoRedo()

  const panelVisible = reactive({
    material: true,
    layer: true,
    property: true,
  })

  const page = ref<PageSchema>({
    canvas: {
      width: 1920,
      height: 1080,
      backgroundColor: '#0d121b',
    },
    nodes: [],
  })

  const canvas = toRef(page.value, 'canvas')

  /**
   * 当前编辑器中组件的列表
   */
  const nodes = toRef(page.value, 'nodes')

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

  function setNodes(newNodes) {
    applyChange(nodes, 'value', newNodes)
  }

  function addNode(node: MaterialSchema) {
    setNodes([...nodes.value, node])
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

  /**
   * 复制节点
   * @param node
   */
  function copyNode(node: MaterialSchema) {
    const newNode = JSON.parse(JSON.stringify(node))
    newNode.id = crypto.randomUUID()
    newNode.layout.x += 20
    newNode.layout.y += 20
    addNode(newNode)
    selectNode(newNode.id)
  }

  /**
   * 删除节点
   * @param node
   */
  function removeNode(node: MaterialSchema) {
    setNodes(nodes.value.filter((item) => item.id !== node.id))
    selectedNodeIds.value = selectedNodeIds.value.filter((id) => id !== node.id)
  }

  /**
   * 移动节点到最上层
   * @param node
   */
  function moveTop(node: MaterialSchema) {
    const splicedNodes = findNodeIndex(node.id)
    setNodes([node, ...splicedNodes])
  }

  function moveBottom(node: MaterialSchema) {
    const splicedNodes = findNodeIndex(node.id)
    setNodes([...splicedNodes, node])
  }

  /**
   * 查找节点索引
   * @param id
   */
  function findNodeIndex(id: string) {
    const index = nodes.value.findIndex((item) => item.id === id)
    const splicedNodes = nodes.value.toSpliced(index, 1)
    return splicedNodes
  }

  /**
   * 锁定节点
   * @param node
   */
  function toggleLock(node: MaterialSchema) {
    node.locked = !node.locked
    applyChange(node, 'locked', !node.locked)
  }

  function updateNode(id, newNode: MaterialSchema) {
    // 使用 map 返回新列表，在列表中替换
    const newNodes = nodes.value.map((node) => (node.id === id ? newNode : node))
    // 设置新节点
    setNodes(newNodes)
  }

  return {
    panelVisible,
    nodes,
    page,
    canvas,
    selectedNodeId,
    selectedNodeIds,
    selectedNode,
    addNode,
    selectNode,
    selectNodes,
    deleteNode,
    findNode,
    clearSelected,
    copyNode,
    removeNode,
    moveTop,
    moveBottom,
    toggleLock,
    updateNode,
  }
})
