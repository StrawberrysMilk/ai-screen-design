import type { MaterialSchema } from '@/schema/material.ts'
import type { PageSchema } from '@/schema/page.ts'
import { setValue } from '@/utils'

interface runtimeContext {
  /**
   * 获取节点
   * getNode('123') => { type: 'text', name: '文本', id: '123', layout: { x: 0, y: 0, width: 100, height: 100 }, props: {} }
   * @param id
   */
  getNode(id: string): MaterialSchema | undefined

  /**
   * 修改节点属性
   * @param id
   * @param key
   * @param value
   * setAttribute('123', 'props.context', '新的文本')
   */
  setAttribute(id: string, key: string, value: any): void

  /**
   * 更新节点的 props
   * @param id
   * @param key
   * @param value
   * setProp('123', 'context', '新的文本')
   */
  setProp(id: string, key: string, value: any): void

  /**
   * 更新节点的 style
   * @param id
   * @param key
   * @param value
   */
  setStyle(id: string, key: string, value: any): void

  /**
   * 注册组件实例
   * @param instances
   */
  registerNodeInstance(instances: Record<string, any>): void

  /**
   * 触发 指定节点组件实例的事件
   * @param id
   * @param name
   * @param args
   * trigger('123', 'refresh') => 触发id为123的组件实例的refresh事件
   */
  trigger(id: string, name: string, ...args: any[]): any

  /**
   * 通过 dataId 刷新指定数据源的所有节点
   * @param dataId
   * @param args
   *  refreshNodesByDataId('dataId1') => 触发所有dataId为dataId1的节点的refresh事件
   */
  refreshNodesByDataId(dataId: string, ...args: any[]): void
}

export function createRuntimeContext(page: Ref<PageSchema>): runtimeContext {
  let instanceMap = {}

  const getNode: runtimeContext['getNode'] = (id) => {
    return page.value?.nodes?.find((node) => node.id === id)
  }

  const setAttribute: runtimeContext['setAttribute'] = (id, key, value) => {
    const node = getNode(id)
    if (!node) {
      console.warn(`没有找到${id}对应的节点`)
      return
    }
    setValue(node, key, value)
  }

  const setProp: runtimeContext['setProp'] = (id, key, value) => {
    setAttribute(id, `props.${key}`, value)
  }

  const setStyle: runtimeContext['setStyle'] = (id, key, value) => {
    setAttribute(id, `style.${key}`, value)
  }

  const registerNodeInstance: runtimeContext['registerNodeInstance'] = (instances) => {
    instanceMap = instances
  }

  const trigger: runtimeContext['trigger'] = (id, name, ...args) => {
    const instance = instanceMap[id]
    if (!instance) {
      console.warn(`没有找到${id}对应的组件实例`)
      return
    }
    if (typeof instance[name] !== 'function') {
      console.warn(`组件实例${id}没有${name}方法`)
      return
    }
    /**
     * 假设调用了组件的 getData， 那么 getData 返回的 123， trigger 就会返回 123
     */
    return instance[name]?.(...args)
  }

  const refreshNodesByDataId: runtimeContext['refreshNodesByDataId'] = (dataId, ...args) => {
    const nodes = page.value?.nodes?.filter((node) => node.dataId === dataId)
    if (!nodes || nodes.length === 0) {
      console.warn(`没有找到dataId为${dataId}对应的节点`)
      return
    }
    nodes.forEach((node) => {
      trigger(node.id, 'refresh', ...args)
    })
  }

  return {
    getNode,
    setAttribute,
    setProp,
    setStyle,
    registerNodeInstance,
    trigger,
    refreshNodesByDataId,
  }
}
