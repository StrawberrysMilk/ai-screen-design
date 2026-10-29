import type { ZodType } from 'zod'

interface Layout {
  x: number
  y: number
  width: number
  height: number
}

export interface MaterialEvent {
  // 事件类型 click mousemove
  type: string
  // 事件名
  name: string
  /**
   * 函数体
   * const code = 'console.log(a)'
   * const fn = new Function(code)
   * fn(123456)
   */
  code: string
  /**
   * 事件标题
   */
  title: string

  /**
   * 最终根据 code 生成的函数
   */
  handler?: Function
}

export interface MaterialSchema {
  type: string
  name: string
  id: string
  locked?: boolean
  layout: Layout
  style?: Record<string, any>
  props: Record<string, any>
  // 数据源 id
  dataId?: string
  events?: MaterialEvent[]
}

interface SetterSchema {
  key: string
  label: string
  type: string
  [key: string]: any
}

interface EventOption {
  label: string
  value: string
  // 触发时机
  trigger: string
  // 事件处理函数的 payload
  payload: string
}

export interface MaterialDefinition {
  //region 物料元数据
  name: string
  group: string
  icon: string
  configSchema: ZodType
  //endregion
  eventOptions?: EventOption[]
  setters: SetterSchema[]

  schema: Omit<MaterialSchema, 'id'>
}
