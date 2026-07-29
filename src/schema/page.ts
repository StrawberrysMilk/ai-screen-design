import type { MaterialSchema } from '@/schema/material.ts'
import type { HttpMethod } from '@/composables/enum.ts'

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
  /**
   * 接口请求的url地址
   */
  url?: string
  /**
   * 接口请求的方式
   */
  method?: HttpMethod
  /**
   * 接口请求返回数据的路径，支持点语法
   * data = { list: [] }
   *  responsePath = 'list'
   * data = { data: { list: [] } }
   *  responsePath = 'data.list'
   *  结果为 []
   */
  responsePath?: string
  /**
   * 数据源的轮询间隔，单位为毫秒
   */
  interval?: number
  /**
   * 接口请求的参数
   */
  params?: Record<string, any>
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
