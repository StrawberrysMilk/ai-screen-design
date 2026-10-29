import type { MaterialSchema } from '@/schema/material.ts'
import type { PageSchema } from '@/schema/page.ts'
import { setValue } from '@/utils'
import type { RuntimeContext } from '@/runtime/context-types.ts'

export function createRuntimeContext(page: Ref<PageSchema>): RuntimeContext {
  let instanceMap = {}

  /**
   * 获取节点
   * getNode('123') => {id:'123',...}
   */
  const getNode: RuntimeContext['getNode'] = (id) => {
    return page.value.nodes.find((node) => node.id === id)
  }

  const setAttribute: RuntimeContext['setAttribute'] = (id, key, value) => {
    const node = getNode(id)
    if (!node) {
      console.warn(`没找到${id}节点`)
      return
    }
    setValue(node, key, value)
  }

  const setProp: RuntimeContext['setProp'] = (id, key, value) => {
    setAttribute(id, `props.${key}`, value)
  }

  const setStyle: RuntimeContext['setProp'] = (id, key, value) => {
    setAttribute(id, `style.${key}`, value)
  }

  const registerNodeInstance: RuntimeContext['registerNodeInstance'] = (instances) => {
    instanceMap = instances
  }

  const trigger: RuntimeContext['trigger'] = (id, name, ...args) => {
    const instance = instanceMap[id]
    if (!instance) {
      console.warn(`没找到 ${id} 的组件实例`)
    }
    /**
     * 假设调用了组件的 getData，那么 getData 返回 123，trigger 也返回 123
     */
    return instance[name]?.(...args)
  }

  const refreshNodesByDataId: RuntimeContext['refreshNodesByDataId'] = (dataId, ...args) => {
    const nodes = page.value.nodes.filter((node) => node.dataId === dataId)
    nodes.forEach((node) => {
      trigger(node.id, 'refresh', ...args)
    })
  }

  const dispatch: RuntimeContext['dispatch'] = (id, name, payload) => {
    // 执行事件
    const node = getNode(id)
    if (!node) {
      console.warn(`没找到${id}节点`)
      return
    }
    const event = node.events?.find((event) => event.name === name)
    if (event) {
      // 找到了事件，执行 handler
      event.handler?.(payload)
    }
  }

  return {
    getNode,
    setAttribute,
    setProp,
    setStyle,
    registerNodeInstance,
    trigger,
    refreshNodesByDataId,
    dispatch,
  }
}
