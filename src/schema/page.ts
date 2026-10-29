import type { MaterialSchema } from '@/schema/material.ts'

export interface DataSourceSchema {
  /**
   * 数据源类型
   * static => 静态数据
   * api => 接口请求回来的数据
   */
  type: 'static' | 'api'
  id: string
  name: string
  /**
   * 数据源的载体
   */
  data: any

  /**
   * 接口请求的地址
   */
  url?: string
  /**
   * 请求方法
   */
  method?: 'get' | 'post'
  /**
   * 相应路径
   * data = { list:[/../] }
   * list
   */
  responsePath?: string
  /**
   * 接口轮训请求时间，ms
   */
  interval?: number

  /**
   * 预设参数，会发送给后端
   */
  params?: Record<string, any>

  /**
   * data 字段的描述信息
   */
  dataDescription: string
}

interface CanvasSchema {
  width: number
  height: number
  backgroundColor: string
}

export interface PageSchema {
  id?: string
  canvas: CanvasSchema
  nodes: MaterialSchema[]
  dataSources: DataSourceSchema[]
}
