import type { DataSourceSchema } from '@/schema/page.ts'
import axios from 'axios'
import { getValue } from '@/utils'

export function useDataSource(dataId: Ref<string>) {
  const dataSources = inject<Ref<DataSourceSchema[]>>('dataSources')
  const loading = ref(false)
  const error = ref()
  let timer
  /**
   * source :
   * id
   * type = static | api
   * name
   * data
   */
  const source = computed(() => {
    return dataSources.value.find((item) => item.id === dataId.value)
  })

  const data = ref()

  async function loadData(params?: Record<string, any>) {
    // 取消上一次的定时任务
    clearTimeout(timer)
    if (!source.value) return
    if (source.value.type === 'api') {
      try {
        // 请求之前，设置 loading
        loading.value = true
        // 等一个 Promise
        const res = await fetchData(source.value, params)

        data.value = res
      } catch (e) {
        // 报错的信息
        error.value = e
      } finally {
        // 请求回来了，取消 loading
        loading.value = false
        if (source.value.interval) {
          timer = setTimeout(() => {
            loadData()
          }, source.value.interval)
        }
      }
    } else {
      // 静态数据源
      data.value = source.value.data
    }
  }

  onBeforeUnmount(() => {
    // 组件销毁之前，清理掉定时器
    clearTimeout(timer)
  })

  /**
   * 只要 source 发生变化，立即调用 loadData
   */
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
 *   '{"url":"/api/data","method":"get","params":{"date":"2026-01-01"}}': Promise
 * }
 */

const requestMap = {}

export async function fetchData(source: DataSourceSchema, data?: Record<string, any>) {
  // 获取url参数
  const search = new URLSearchParams(location.search)
  // 把 url 参数转对象
  const params = Object.fromEntries(search.entries())

  const queryParams = {
    // 请求的参数
    ...source.params,
    // URL 上面的参数优先级高，可以覆盖预设参数
    ...params,
    // 手动传递的参数，优先级最高
    ...data,
  }
  const paramsKey = source.method === 'post' ? 'data' : 'params'

  const config = {
    url: source.url,
    /**
     * 请求方法 get post
     */
    method: source.method,
    [paramsKey]: queryParams,
  }

  const key = JSON.stringify(config)

  if (requestMap[key]) {
    console.log('缓存了，不发请求')
    // 有缓存，直接返回，不请求了
    return requestMap[key]
  }
  /**
   * 没请求过，直接发送
   */
  const promise = axios
    .request(config)
    .then((res) => {
      return getValue(res.data, source.responsePath)
    })
    .finally(() => {
      // 回来了就删掉
      delete requestMap[key]
    })
  requestMap[key] = promise
  // res.data = { list:[] }
  // source.responsePath = 'list'
  return promise
}
