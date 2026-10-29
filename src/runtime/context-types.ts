// 这份类型既供前端使用，也会以原文发送给事件生成节点。
// 生成的 event.code 是 JavaScript 函数体，不包含 TypeScript 类型标注。

// node 节点，具体这里只是做占位，具体以物料的 schema 为准，物料 schema 里有 props、style、events 等字段。
type RuntimeNode = any

export interface RuntimeContext {
  /** 按节点 ID 读取当前页面中的节点；不存在时返回 undefined。 */
  getNode(id: string): RuntimeNode | undefined
  /** 按路径修改节点字段，例如 setAttribute(id, 'props.content', '新文本')。 */
  setAttribute(id: string, key: string, value: unknown): void
  /** 修改 props 中的字段，key 不加 props. 前缀；例如 setProp(id, 'content', '新文本')。也支持 option.title.text 等点路径。 */
  setProp(id: string, key: string, value: unknown): void
  /** 修改 style 中的字段，例如 setStyle(id, 'color', '#fff')。 */
  setStyle(id: string, key: string, value: unknown): void
  /** 注册节点组件实例，供 trigger 调用。 */
  registerNodeInstance(instances: Record<string, any>): void
  /** 调用指定节点组件实例上的方法，并返回该方法的结果。 */
  trigger(id: string, name: string, ...args: any[]): any
  /** 调用所有绑定了 dataId 的节点组件的 refresh 方法。 */
  refreshNodesByDataId(dataId: string, ...args: any[]): void
  /** 按节点 ID 和事件 name 执行已配置的事件函数。 */
  dispatch(id: string, name: string, payload?: unknown): void
}

/** 当前正在触发的事件可使用的页面运行时 API。 */
declare const $context: RuntimeContext
/** 当前触发事件的节点。 */
declare const $node: RuntimeNode
/** 当前事件携带的数据；具体内容由物料 eventOptions 的 payload 描述。 */
declare const $payload: unknown
