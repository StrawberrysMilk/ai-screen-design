import type { DataSourceSchema } from '@/schema/page.ts'
import axios from 'axios'

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
        // 获取当前页面的查询参数
        const search = new URLSearchParams(location.search)
        // 将查询参数转换为对象
        const params = Object.fromEntries(search.entries())
        const res = await axios.get(url, {
          params: {
            ...source.value.params,
            // 合并当前页面的查询参数
            ...params,
          },
        })
        data.value = res?.data || []
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
