<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useEditorStore } from '@/stores/editor.ts'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import DataSourceManager from '@/editor/toolbar/components/DataSourceManager.vue'
defineOptions({
  name: 'ToolbarRight',
})
const editorStore = useEditorStore()
const { page } = storeToRefs(editorStore)
// 全局 json 编辑抽屉
const visible = ref(false)
// 全局数据源弹框
const dataSourceVisible = ref(false)
const jsonText = ref<string>('')

const inputRef = useTemplateRef('inputRef')
const dataSourceManagerRef = useTemplateRef('dataSourceManagerRef')

function previewJson() {
  visible.value = true
  jsonText.value = JSON.stringify(page.value, null, 2)
}

/**
 * 确认更新 JSON
 */
function onConfirm() {
  // 拿到新节点
  const newPage = JSON.parse(jsonText.value)
  // 更新节点
  editorStore.setPage(newPage)
  visible.value = false
}

/**
 * 导出 JSON
 */
function onExport() {
  const json = JSON.stringify(page.value, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'screen-design.json'

  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  URL.revokeObjectURL(url)
}

function onImport() {
  inputRef.value.click()
  // const input = document.createElement('input')
  // input.type = 'file'
  // input.accept = '.json'
  // input.onchange = (e: any) => {
  //   const file = e.target.files[0]
  //   const reader = new FileReader()
  //   reader.onload = (e) => {
  //     const json = e.target?.result as string
  //     const newPage = JSON.parse(json)
  //     editorStore.setPage(newPage)
  //   }
  // }
}

/**
 * 文件选择变化 导入
 * @param e
 */
async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const text = await file.text()
  try {
    const newPage = JSON.parse(text)
    editorStore.setPage(newPage)
    ElMessage.success('导入成功')
  } catch {
    console.error('请检查JSON是 否合法')
  }

  // 方法二
  // const reader = new FileReader()
  // reader.onload = (e) => {
  //   const json = e.target?.result as string
  //   const newPage = JSON.parse(json)
  //   editorStore.setPage(newPage)
  // }
  // reader.readAsText(file)
}

function openDataSource() {
  dataSourceVisible.value = true
}

function onSave() {
  // 调用 DataSourceManager 的保存方法
  dataSourceManagerRef.value.save()
  dataSourceVisible.value = false
  ElMessage.success('保存成功')
}
</script>

<template>
  <div class="flex gap-20 toolbar-right justify-end">
    <span>
      <Icon icon="fluent:preview-link-16-filled" />
    </span>
    <span @click="previewJson">
      <Icon icon="si:json-duotone" />
    </span>
    <span>
      <Icon icon="entypo:publish" />
    </span>
    <span @click="openDataSource">
      <Icon icon="mdi:database" />
    </span>
    <span @click="onImport">
      <Icon icon="mdi:import" />
    </span>
    <span @click="onExport">
      <Icon icon="mdi:export" />
    </span>
    <input ref="inputRef" type="file" v-show="false" @change="onFileChange" />
    <el-drawer destroy-on-close title="编辑 JSON" size="800" v-model="visible">
      <MonacoEditor v-model="jsonText" />
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="onConfirm">确认</el-button>
      </template>
    </el-drawer>
    <el-dialog destroy-on-close title="数据源配置" v-model="dataSourceVisible" width="800">
      <!--      数据源管理      -->
      <DataSourceManager ref="dataSourceManagerRef" />
      <template #footer>
        <el-button @click="dataSourceVisible = false">关闭</el-button>
        <el-button type="primary" @click="onSave">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.toolbar-right {
  span {
    border: 1px solid #3b465b;
    border-radius: 4px;
    cursor: pointer;
  }
}
</style>
