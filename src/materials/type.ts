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
  layout: Layout
  style?: Record<string, any>
  props: Record<string, any>
}

export interface MaterialDefinition {
  // regin 物料元数据
  name: string
  icon: string
  group: string
  schema: Omit<MaterialSchema, 'id'>
  // endregion
}
