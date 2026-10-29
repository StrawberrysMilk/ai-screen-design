import { defineStore } from 'pinia'
import type { MaterialSchema } from '@/schema/material.ts'
import type { PageSchema } from '@/schema/page.ts'
import { useUndoRedo } from '@/composables/useUndoRedo.ts'

export const useEditorStore = defineStore('editor', () => {
  const { applyChange } = useUndoRedo()

  const panelVisible = reactive({
    material: false,
    layer: false,
    property: false,
    ai: true,
  })

  const page = ref<PageSchema>({
    canvas: {
      width: 1920,
      height: 1080,
      backgroundColor: '#0d121b',
    },
    nodes: [],
    dataSources: [
      {
        type: 'static',
        id: '123',
        name: '销售数据',
        dataDescription:
          'data 是一个对象数组，每个对象代表一条销售记录，包含月份和销售额字段。label 字段表示月份，value 字段表示销售额。',
        data: [
          {
            label: '一月',
            value: 100,
          },
          {
            label: '二月',
            value: 200,
          },
          {
            label: '三月',
            value: 300,
          },
        ],
      },
      {
        type: 'static',
        id: '456',
        name: '访问数据',
        dataDescription:
          'data 是一个对象数组，每个对象代表一条访问记录，包含访问月份和具体的访问量字段。label 字段表示月份，value 字段表示访问量。',
        data: [
          {
            label: '一月',
            value: 1000,
          },
          {
            label: '二月',
            value: 800,
          },
          {
            label: '三月',
            value: 1100,
          },
        ],
      },
      {
        type: 'api',
        id: '567',
        name: '上升趋势',
        url: '/api/data',
        dataDescription:
          'data 是一个对象数组，每个对象代表一条上升趋势记录，包含具体月份和具体的趋势量字段。label 字段表示月份，value 字段表示趋势量。',
        method: 'get',
        // interval: 2000,
        params: {
          date: '2026-01-01',
        },
        data: [],
      },
    ],
  })

  const canvas = toRef(page.value, 'canvas')

  /**
   * 当前编辑器中组件的列表
   */
  const nodes = toRef(page.value, 'nodes')
  /**
   * 数据源
   */
  const dataSources = toRef(page.value, 'dataSources')

  function setPage(newPage: PageSchema) {
    // 合并 newPage 的所有属性到 page.value 中
    Object.assign(page.value, newPage)
  }

  const selectedNodeIds = ref([])
  /**
   * 当前选中节点的id
   * 多选的情况下 为 null
   */
  const selectedNodeId = computed(() => {
    return selectedNodeIds.value.length === 1 ? selectedNodeIds.value[0] : null
  })

  /**
   * 当前选中的节点
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
   */
  function selectNode(id: string) {
    selectedNodeIds.value = [id]
  }

  function selectNodes(ids: string[]) {
    selectedNodeIds.value = ids
  }

  function findNode(id: string) {
    return nodes.value.find((node) => node.id === id)
  }

  function clearSelected() {
    selectedNodeIds.value = []
  }

  function copyNode(node: MaterialSchema) {
    const newNode = JSON.parse(JSON.stringify(node))
    newNode.id = crypto.randomUUID()
    newNode.layout.x += 20
    newNode.layout.y += 20
    addNode(newNode)
    selectNode(newNode.id)
  }

  function updateDataSource(dataSource) {
    const newDataSources = dataSources.value.map((ds) =>
      ds.id === dataSource.id ? dataSource : ds,
    )
    applyChange(dataSources, 'value', newDataSources)
  }

  function addDataSource(dataSource) {
    const newDataSources = [...dataSources.value, dataSource]
    applyChange(dataSources, 'value', newDataSources)
  }

  function removeNode(node: MaterialSchema) {
    setNodes(nodes.value.filter((item) => item.id !== node.id))
    selectedNodeIds.value = selectedNodeIds.value.filter((id) => id !== node.id)
  }
  function moveTop(node: MaterialSchema) {
    // [c,a,b,d]
    const index = nodes.value.findIndex((item) => item.id === node.id)
    const splicedNodes = nodes.value.toSpliced(index, 1)
    setNodes([node, ...splicedNodes])
  }
  function moveBottom(node: MaterialSchema) {
    // [c,a,b,d]
    const index = nodes.value.findIndex((item) => item.id === node.id)
    const splicedNodes = nodes.value.toSpliced(index, 1)
    setNodes([...splicedNodes, node])
  }

  function toggleLock(node: MaterialSchema) {
    applyChange(node, 'locked', !node.locked)
  }

  function updateNode(id, newNode) {
    if (!newNode && typeof id === 'object') {
      newNode = id
      id = newNode.id
    }
    // 使用 map 返回新列表，在新列表中做了替换
    const newNodes = nodes.value.map((node) => (node.id === id ? newNode : node))
    // 设置新的 nodes
    setNodes(newNodes)
  }

  return {
    panelVisible,
    nodes,
    page,
    canvas,
    dataSources,
    selectedNode,
    selectNode,
    addNode,
    setPage,
    selectedNodeId,
    selectedNodeIds,
    selectNodes,
    clearSelected,
    findNode,
    copyNode,
    removeNode,
    moveTop,
    moveBottom,
    toggleLock,
    updateNode,
    updateDataSource,
    addDataSource,
  }
})
