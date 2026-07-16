interface Layout {
  x: number
  y: number
  width: number
  height: number
}

export interface MaterialSchema {
  type: string
  name: string
  id: string
  locked?: boolean
  layout: Layout
  style?: Record<string, any>
  props: Record<string, any>
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
