import type { DataSourceSchema } from '@/schema/page.ts'
import axios from 'axios'
import { getValue } from '@/utils'

export function useDataSource(dataId: Ref<string>) {
  const dataSources = inject<Ref<DataSourceSchema[]>>('dataSources')

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

  async function loadData() {
    if (!source.value) return
    if (source.value.type === 'api') {
      const url = source.value.url
      try {
        const res = await fetchData(source.value)
        data.value = res || []
      } finally {
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

  watch(source, loadData, { immediate: true })

  return {
    data,
  }
}

export async function fetchData(source: DataSourceSchema) {
  if (source.type === 'api') {
    const url = source.url
    // 获取当前页面的查询参数
    const search = new URLSearchParams(location.search)
    // 将查询参数转换为对象
    const params = Object.fromEntries(search.entries())
    const queryParams = {
      ...source.params,
      // 合并当前页面的查询参数
      ...params,
    }
    const paramsKey = source.method === 'GET' ? 'params' : 'data'
    const res = await axios.request({
      url: source.url,
      method: source.method,
      [paramsKey]: queryParams,
    })
    // data = { list: [] }
    // source.responsePath = 'list'
    // if (source.responsePath) {
    // }
    return getValue(res.data, source?.responsePath)
  } else {
    return Promise.resolve(source.data || [])
  }
}
