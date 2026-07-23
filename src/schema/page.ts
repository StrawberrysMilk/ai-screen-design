import type { MaterialSchema } from '@/schema/material.ts'

export interface DataSourceSchema {
  /**
   * 数据源类型
   * static =》 静态数据
   * api =》 接口请求回来的数据
   */
  name: string
  id: string
  type: 'static' | 'api'
  /**
   * 数据源的载体
   */
  data: any
}

interface CanvasSchema {
  width: number
  height: number
  backgroundColor: string
}

export interface PageSchema {
  canvas: CanvasSchema
  nodes: MaterialSchema[]
  dataSources: DataSourceSchema[]
}
