<script setup lang="ts">
import { useEditorStore } from '@/stores/editor.ts'
import { storeToRefs } from 'pinia'
import type { DataSourceSchema } from '@/schema/page.ts'
import { deepClone } from '@/utils'
import { Icon } from '@iconify/vue'
import { fetchData } from '@/composables/useDataSource.ts'
import type { HttpMethod } from '@/composables/enum.ts'

defineOptions({
  name: 'DataSourceManager',
})

const responseText = ref('')

const methods = ref<HttpMethod[]>(['GET', 'POST'])

const editorStore = useEditorStore()
const { dataSources } = storeToRefs(editorStore)

/**
 * 深拷贝数据源
 * 1. data params 这些需要传字符串
 * 2. 弹框需要点击确认，才能应用到全局数据源，而不是实时修改
 */
const data = ref(
  deepClone(dataSources.value).map((item) => {
    return {
      ...item,
      data: item.data ? JSON.stringify(item.data, null, 2) : undefined,
      params: item.params ? JSON.stringify(item.params, null, 2) : undefined,
    }
  }),
)

const activeSource = ref()
function selectDataSource(source: DataSourceSchema) {
  activeSource.value = source
}

/**
 * 新增数据源
 */
function onAdd() {
  const newSource: DataSourceSchema = {
    id: crypto.randomUUID(),
    name: '自定义',
    type: 'static',
    data: '',
    params: '{}',
  }
  data.value.push(newSource)
  selectDataSource(newSource)
}

/**
 * 删除数据源
 * @param id
 */
function removeDataSource(id: string) {
  const index = data.value.findIndex((item) => item.id === id)
  if (index !== -1) {
    data.value.splice(index, 1)
    if (activeSource.value?.id === id) {
      selectDataSource(null)
    }
  }
}

function onRequest() {
  fetchData({
    ...activeSource.value,
    params: activeSource.value.params ? JSON.parse(activeSource.value.params) : undefined,
  }).then((res) => {
    responseText.value = JSON.stringify(res, null, 2)
  })
}

defineExpose({
  save() {
    const _data = deepClone(
      data.value.map((item) => {
        return {
          ...item,
          data: item.data ? JSON.parse(item.data) : undefined,
          params: item.params ? JSON.parse(item.params) : undefined,
        }
      }),
    )
    // 更新全局数据源
    editorStore.page.dataSources = _data
  },
})
</script>

<template>
  <div class="data-source-container">
    <div class="data-source-sidebar">
      <el-button @click="onAdd" type="primary" size="small">新增</el-button>
      <div
        class="data-source-item"
        :class="{ active: item.id === activeSource?.id }"
        v-for="item in data"
        :key="item.id"
        @click="selectDataSource(item)"
      >
        <span>{{ item.name }}</span>
        <span @click.stop="removeDataSource(item.id)"><Icon icon="mdi:delete" color="red" /></span>
      </div>
    </div>
    <div class="data-source-content">
      <el-form v-if="activeSource">
        <el-form-item label="名称">
          <el-input v-model="activeSource.name"></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="activeSource.type">
            <el-radio-button label="静态" value="static" />
            <el-radio-button label="API" value="api" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数据" v-if="activeSource.type === 'static'">
          <monaco-editor v-model="activeSource.data" />
        </el-form-item>
        <div v-else>
          <!--          API 数据源          -->
          <el-form-item label="请求地址">
            <el-input v-model="activeSource.url" />
          </el-form-item>
          <el-form-item label="请求方法">
            <el-select
              v-model="activeSource.method"
              placeholder="请选择请求方法"
              :options="methods.map((method) => ({ label: method, value: method }))"
            />
          </el-form-item>
          <el-form-item label="轮询周期">
            <el-input-number v-model="activeSource.interval" :min="0" />
          </el-form-item>
          <el-form-item label="请求参数">
            <monaco-editor v-model="activeSource.params" />
          </el-form-item>
          <el-form-item label="响应路径">
            <el-input v-model="activeSource.responsePath" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onRequest">请求预览</el-button>
          </el-form-item>
          <el-form-item>
            <monaco-editor v-model="responseText" />
          </el-form-item>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.data-source-container {
  display: flex;
  gap: 20px;
  height: 600px;
  .data-source-sidebar {
    width: 200px;
    flex: none;
    border: 1px solid var(--border-color);
    padding: 10px;
    overflow: auto;
    .data-source-item {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 10px;
      padding: 0 10px;
      cursor: pointer;
      background: bg-mix(20);
      &.active {
        background: var(--el-color-primary);
      }
    }
  }
  .data-source-content {
    flex: 1;
    border: 1px solid var(--border-color);
    padding: 10px;
    overflow: auto;
  }
}
</style>
