interface Layout {
  x: number
  y: number
  width: number
  height: number
}

export interface MaterialEvent {
  // 事件类型 clikc
  type: string
  // 事件名称
  name: string
  /**
   * 函数体
   * const code = 'console.log(a)'
   * const fn = new Function('a', code)
   * fn(123456)
   */
  code: string
  data?: string
  // 事件标题
  title: string
  /**
   * 最终根据 code 生成的函数
   */
  handler?: (...args: any[]) => any
}

export interface MaterialSchema {
  type: string
  name: string
  id: string
  locked?: boolean
  layout: Layout
  style?: Record<string, any>
  props: Record<string, any>
  // 数据源id
  dataId?: string
  events?: MaterialEvent[]
}

export interface settersSchema {
  key: string
  label: string
  type: string
  [key: string]: any
}

export interface MaterialDefinition {
  // regin 物料元数据
  name: string
  icon: string
  group: string
  // endregion
  setters: settersSchema[]
  schema: Omit<MaterialSchema, 'id'>
}
