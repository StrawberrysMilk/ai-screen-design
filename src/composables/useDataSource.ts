import type { DataSourceSchema } from '@/schema/page.ts'

export function useDataSource(dataId: Ref<string>) {
  const dataSources = inject<Ref<DataSourceSchema[]>>('dataSources')

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

  const data = computed(() => source.value?.data || [])

  return {
    data,
  }
}
