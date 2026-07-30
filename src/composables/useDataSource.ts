import type { DataSourceSchema } from '@/schema/page.ts'
import axios from 'axios'
import { getValue } from '@/utils'

export function useDataSource(dataId: Ref<string>) {
  const dataSources = inject<Ref<DataSourceSchema[]>>('dataSources')
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  let timer: any = null

  /**
   *  source
   *  id
   *  type = 'static' | 'api'
   *  data
   *  name
   */
  const source = computed(() => {
    return dataSources.value.find((i) => i.id === dataId.value)
  })

  const data = ref()

  async function loadData(params?: Record<string, any>) {
    // 清除定时器，避免重复请求
    clearTimeout(timer)
    if (!source.value) return
    if (source.value.type === 'api') {
      const url = source.value.url
      try {
        loading.value = true
        const res = await fetchData(source.value, params)
        data.value = res || []
      } catch (e) {
        error.value = e
      } finally {
        loading.value = false
        if (source.value?.interval) {
          timer = setTimeout(() => loadData(), source.value?.interval)
        }
      }
    } else {
      data.value = source.value?.data || []
    }
  }

  onBeforeUnmount(() => {
    // 清除定时器
    clearTimeout(timer)
  })

  watch(
    source,
    () => {
      loadData()
    },
    { immediate: true },
  )

  return {
    data,
    loading,
    error,
    refresh: loadData,
  }
}

/**
 * 相同的 url、params、method 做请求复用
 * {
 *   '/api/data?a=1'：Promise
 * }
 * @param source
 * @param data
 */
const requestMap: Record<string, Promise<any>> = {}
export async function fetchData(source: DataSourceSchema, data?: Record<string, any>) {
  if (source.type === 'api') {
    // 获取当前页面的查询参数
    const search = new URLSearchParams(location.search)
    // 将查询参数转换为对象
    const params = Object.fromEntries(search.entries())
    const queryParams = {
      ...source.params,
      // 合并当前页面的查询参数
      ...params,
      ...data,
    }
    const paramsKey = source.method === 'GET' ? 'params' : 'data'
    const config = {
      url: source.url,
      method: source.method,
      [paramsKey]: queryParams,
    }

    const key = JSON.stringify(config)
    // 有缓存，直接缓存，不请求了
    if (requestMap[key]) return requestMap[key]

    /**
     * 只缓存进行中的请求。相同请求并发时复用 Promise，完成后允许再次刷新。
     */
    const promise = axios
      .request(config)
      .then((res) => {
        return getValue(res.data, source?.responsePath)
      })
      .finally(() => {
        // 回来了就删掉
        delete requestMap[key]
      })
    // data = { list: [] }
    // source.responsePath = 'list'
    // if (source.responsePath) {
    // }
    requestMap[key] = promise
    return await promise
  } else {
    return Promise.resolve(source.data || [])
  }
}
